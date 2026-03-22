import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    const where: any = {};
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        where.data.lte = fim;
      }
    }

    // Receita Bruta (vendas)
    const vendas = await prisma.movimentacao.aggregate({
      where: { ...where, categoria: "VENDA" },
      _sum: { valor: true },
    });

    // CMV (custo da mercadoria vendida = compras)
    const compras = await prisma.movimentacao.aggregate({
      where: { ...where, categoria: "COMPRA" },
      _sum: { valor: true },
    });

    // Despesas operacionais por subcategoria
    const despesasRaw = await prisma.movimentacao.findMany({
      where: { ...where, categoria: "DESPESA" },
      select: { subcategoria: true, valor: true },
    });

    const despesasPorCategoria: Record<string, number> = {};
    let totalDespesas = 0;
    for (const d of despesasRaw) {
      const cat = d.subcategoria || "OUTROS";
      despesasPorCategoria[cat] = (despesasPorCategoria[cat] || 0) + d.valor;
      totalDespesas += d.valor;
    }

    // Perdas
    const perdas = await prisma.movimentacao.aggregate({
      where: { ...where, categoria: "PERDA" },
      _sum: { valor: true },
    });

    // Sangrias e Suprimentos
    const sangrias = await prisma.movimentacao.aggregate({
      where: { ...where, categoria: "SANGRIA" },
      _sum: { valor: true },
    });
    const suprimentos = await prisma.movimentacao.aggregate({
      where: { ...where, categoria: "SUPRIMENTO" },
      _sum: { valor: true },
    });

    const receitaBruta = vendas._sum.valor || 0;
    const cmv = compras._sum.valor || 0;
    const lucroBruto = receitaBruta - cmv;
    const totalPerdas = perdas._sum.valor || 0;
    const resultadoLiquido = lucroBruto - totalDespesas - totalPerdas;

    return NextResponse.json({
      receitaBruta,
      cmv,
      lucroBruto,
      despesasOperacionais: {
        total: totalDespesas,
        porCategoria: despesasPorCategoria,
      },
      perdas: totalPerdas,
      sangrias: sangrias._sum.valor || 0,
      suprimentos: suprimentos._sum.valor || 0,
      resultadoLiquido,
      margemBruta: receitaBruta > 0 ? ((lucroBruto / receitaBruta) * 100).toFixed(1) : "0.0",
      margemLiquida: receitaBruta > 0 ? ((resultadoLiquido / receitaBruta) * 100).toFixed(1) : "0.0",
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerar DRE" }, { status: 500 });
  }
}
