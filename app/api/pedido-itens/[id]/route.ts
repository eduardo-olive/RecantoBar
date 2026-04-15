import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.pedidoItem.findUnique({
      where: { id },
      include: {
        pedido: { include: { comanda: true } },
        produto: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    // Só permite cancelar se a comanda está aberta
    if (!item.pedido.comanda || item.pedido.comanda.status !== "ABERTA") {
      return NextResponse.json({ error: "Só é possível cancelar itens de comandas abertas" }, { status: 400 });
    }

    // Não permite cancelar se já está sendo preparado ou pronto
    if (item.status === "PREPARANDO") {
      return NextResponse.json({ error: "Item já está sendo preparado. Fale com a cozinha." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Devolver estoque
      await tx.produto.update({
        where: { id: item.produtoId },
        data: { estoque: { increment: item.quantidade } },
      });

      // Remover item
      await tx.pedidoItem.delete({ where: { id } });

      // Atualizar valor total do pedido
      const itensRestantes = await tx.pedidoItem.findMany({
        where: { pedidoId: item.pedidoId },
      });

      if (itensRestantes.length === 0) {
        // Se não tem mais itens, remover o pedido
        await tx.pedido.delete({ where: { id: item.pedidoId } });
      } else {
        const novoTotal = itensRestantes.reduce((acc, i) => acc + i.subtotal, 0);
        await tx.pedido.update({
          where: { id: item.pedidoId },
          data: { valorTotal: novoTotal },
        });
      }
    });

    return NextResponse.json({ message: "Item cancelado e estoque devolvido" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao cancelar item" }, { status: 500 });
  }
}
