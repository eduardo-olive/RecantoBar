import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const movimentacao = await prisma.movimentacao.findUnique({ where: { id } });
    if (!movimentacao) {
      return NextResponse.json({ error: "Movimentação não encontrada" }, { status: 404 });
    }

    if (movimentacao.categoria !== "DESPESA") {
      return NextResponse.json({ error: "Apenas despesas podem ser excluídas por esta rota" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Reverter valor no caixa se estava vinculada
      if (movimentacao.caixaId) {
        const caixa = await tx.caixa.findUnique({ where: { id: movimentacao.caixaId } });
        if (caixa) {
          await tx.caixa.update({
            where: { id: caixa.id },
            data: { valor_atual: { increment: movimentacao.valor } },
          });
        }
      }

      await tx.movimentacao.delete({ where: { id } });
    });

    return NextResponse.json({ message: "Despesa excluída com sucesso" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao excluir despesa" }, { status: 500 });
  }
}
