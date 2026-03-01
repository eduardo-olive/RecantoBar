import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // 1. Verificar se a categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    // 2. Excluir a categoria
    // Nota: Se houver produtos vinculados, o Prisma/SQLite pode impedir a exclusão
    // dependendo das restrições de chave estrangeira.
    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria. Verifique se existem produtos vinculados a ela." },
      { status: 500 }
    );
  }
}