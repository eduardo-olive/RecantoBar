import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { produtoId, novoEstoque, precoCusto, precoVenda } = await request.json();
    if (!produtoId) {
      return NextResponse.json({ error: "produtoId é obrigatório" }, { status: 400 });
    }

    const data: any = {};
    if (novoEstoque !== undefined) data.estoque = Number(novoEstoque);
    if (precoCusto !== undefined) data.precoCusto = Number(precoCusto);
    if (precoVenda !== undefined) data.precoVenda = Number(precoVenda);

    const produto = await prisma.produto.update({
      where: { id: produtoId },
      data,
    });

    return NextResponse.json(produto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Ajuste em lote
export async function PUT(request: Request) {
  try {
    const { ajustes } = await request.json();
    if (!ajustes || !Array.isArray(ajustes)) {
      return NextResponse.json({ error: "Envie um array de ajustes" }, { status: 400 });
    }

    await prisma.$transaction(
      ajustes.map((a: { produtoId: string; novoEstoque?: number; precoCusto?: number; precoVenda?: number }) => {
        const data: any = {};
        if (a.novoEstoque !== undefined) data.estoque = Number(a.novoEstoque);
        if (a.precoCusto !== undefined) data.precoCusto = Number(a.precoCusto);
        if (a.precoVenda !== undefined) data.precoVenda = Number(a.precoVenda);

        return prisma.produto.update({
          where: { id: a.produtoId },
          data,
        });
      })
    );

    return NextResponse.json({ success: true, total: ajustes.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
