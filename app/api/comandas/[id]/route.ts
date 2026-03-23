import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — detalhes da comanda com pedidos e itens
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const comanda = await prisma.comanda.findUnique({
      where: { id },
      include: {
        mesa: { select: { numero: true, nome: true } },
        pedidos: {
          include: {
            itens: {
              include: { produto: { select: { nome: true } } },
            },
          },
          orderBy: { criadoEm: "asc" },
        },
        pagamentos: true,
      },
    });

    if (!comanda) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 });
    }

    return NextResponse.json(comanda);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — cancelar comanda (só se não tiver pedidos)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const comanda = await prisma.comanda.findUnique({
      where: { id },
      include: { pedidos: true },
    });

    if (!comanda) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 });
    }

    if (comanda.pedidos.length > 0) {
      return NextResponse.json({ error: "Não é possível cancelar comanda com pedidos" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.comanda.update({
        where: { id },
        data: { status: "CANCELADA", dataFechamento: new Date() },
      });

      // Liberar mesa se não houver outra comanda aberta
      const outrasAbertas = await tx.comanda.count({
        where: { mesaId: comanda.mesaId, status: "ABERTA", id: { not: id } },
      });
      if (outrasAbertas === 0) {
        await tx.mesa.update({
          where: { id: comanda.mesaId },
          data: { status: "LIVRE" },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
