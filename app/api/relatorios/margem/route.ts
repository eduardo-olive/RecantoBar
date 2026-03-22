import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      include: { categoria: { select: { nome: true } } },
      orderBy: { nome: "asc" },
    });

    const produtosComMargem = produtos.map((p) => {
      const margemAbsoluta = p.precoVenda - p.precoCusto;
      const margemPercentual = p.precoVenda > 0 ? ((margemAbsoluta / p.precoVenda) * 100) : 0;
      return {
        id: p.id,
        nome: p.nome,
        categoria: p.categoria.nome,
        precoVenda: p.precoVenda,
        precoCusto: p.precoCusto,
        estoque: p.estoque,
        margemAbsoluta: Number(margemAbsoluta.toFixed(2)),
        margemPercentual: Number(margemPercentual.toFixed(1)),
        potencialLucro: Number((margemAbsoluta * p.estoque).toFixed(2)),
      };
    });

    // Agrupar por categoria
    const porCategoria: Record<string, { margemMedia: number; count: number; totalPotencial: number }> = {};
    for (const p of produtosComMargem) {
      if (!porCategoria[p.categoria]) {
        porCategoria[p.categoria] = { margemMedia: 0, count: 0, totalPotencial: 0 };
      }
      porCategoria[p.categoria].margemMedia += p.margemPercentual;
      porCategoria[p.categoria].count += 1;
      porCategoria[p.categoria].totalPotencial += p.potencialLucro;
    }

    // Calcular media
    const categorias = Object.entries(porCategoria).map(([nome, data]) => ({
      nome,
      margemMedia: Number((data.margemMedia / data.count).toFixed(1)),
      totalProdutos: data.count,
      potencialLucro: Number(data.totalPotencial.toFixed(2)),
    }));

    return NextResponse.json({ produtos: produtosComMargem, categorias });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao calcular margens" }, { status: 500 });
  }
}
