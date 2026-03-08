import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verificar se o produto existe antes de tentar deletar
    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado no Recanto Planalto" }, 
        { status: 404 }
      );
    }

    // 2. Excluir o produto
    // Diferente da categoria, o produto geralmente é a "ponta" da linha, 
    // mas se ele estiver em uma tabela de "ItensVenda", o Prisma pode barrar.
    await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: `O produto "${produto.nome}" foi removido com sucesso!` 
    });

  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      { error: "Não foi possível excluir o produto. Ele pode estar vinculado a históricos de vendas." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Verificar se o produto existe
    const produtoExiste = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produtoExiste) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    // 2. Atualizar no Banco
    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        nome: body.nome?.toUpperCase(),
        categoriaId: body.categoriaId,
        estoqueMinimo: Number(body.estoqueMinimo),
        estoqueSeguro: Number(body.estoqueSeguro),
        // Adicione precoVenda ou outros campos se necessário
      },
    });

    return NextResponse.json({ 
      message: "Produto atualizado com sucesso!",
      produto: produtoAtualizado 
    });

  } catch (error) {
    console.error("Erro ao editar produto:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar produto." },
      { status: 500 }
    );
  }
}