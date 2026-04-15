import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se a categoria está em uso em alguma movimentação
    const emUso = await prisma.movimentacao.findFirst({
      where: { subcategoria: (await prisma.categoriaDespesa.findUnique({ where: { id } }))?.nome },
    });

    if (emUso) {
      return NextResponse.json(
        { error: "Categoria em uso em despesas registradas. Não é possível excluir." },
        { status: 400 }
      );
    }

    await prisma.categoriaDespesa.delete({ where: { id } });
    return NextResponse.json({ message: "Categoria excluída" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 });
  }
}
