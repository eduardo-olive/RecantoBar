import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Total de Vendas (Saídas no Financeiro)
    const vendas = await prisma.movimentacao.aggregate({
      where: { tipo: "SAIDA" },
      _sum: { valor: true }
    });

    // 2. Total de Compras (Entradas no Financeiro)
    const compras = await prisma.movimentacao.aggregate({
      where: { tipo: "ENTRADA" },
      _sum: { valor: true }
    });

    // 3. Valor total do Inventário (Preço de Custo * Estoque de todos os produtos)
    const produtos = await prisma.produto.findMany({
      select: { estoque: true, precoCusto: true }
    });
    
    const valorEstoque = produtos.reduce((acc, p) => acc + (p.estoque * p.precoCusto), 0);

    return NextResponse.json({
      totalVendas: vendas._sum.valor || 0,
      totalCompras: compras._sum.valor || 0,
      valorInventario: valorEstoque,
      lucroBruto: (vendas._sum.valor || 0) - (compras._sum.valor || 0)
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}