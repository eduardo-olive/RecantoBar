import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

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

    const vendas = await prisma.movimentacao.aggregate({
      where: { ...where, tipo: "SAIDA", categoria: "VENDA" },
      _sum: { valor: true },
    });

    const compras = await prisma.movimentacao.aggregate({
      where: { ...where, tipo: "ENTRADA", categoria: "COMPRA" },
      _sum: { valor: true },
    });

    const despesas = await prisma.movimentacao.aggregate({
      where: { ...where, categoria: "DESPESA" },
      _sum: { valor: true },
    });

    const perdas = await prisma.movimentacao.aggregate({
      where: { ...where, categoria: "PERDA" },
      _sum: { valor: true },
    });

    const produtos = await prisma.produto.findMany({
      select: { estoque: true, precoCusto: true },
    });
    const valorEstoque = produtos.reduce((acc, p) => acc + p.estoque * p.precoCusto, 0);

    const caixa = await getCaixaAberto();

    const totalVendas = vendas._sum.valor || 0;
    const totalCompras = compras._sum.valor || 0;
    const totalDespesas = despesas._sum.valor || 0;
    const totalPerdas = perdas._sum.valor || 0;

    return NextResponse.json({
      totalVendas,
      totalCompras,
      totalDespesas,
      totalPerdas,
      valorInventario: valorEstoque,
      lucroBruto: totalVendas - totalCompras,
      lucroLiquido: totalVendas - totalCompras - totalDespesas - totalPerdas,
      caixa: caixa
        ? {
            id: caixa.id,
            valor_atual: Number(caixa.valor_atual),
            valor_inicial: Number(caixa.valor_inicial),
            status: caixa.status,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
