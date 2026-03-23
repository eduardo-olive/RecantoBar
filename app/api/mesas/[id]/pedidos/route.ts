import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const pedidos = await prisma.pedido.findMany({
      where: {
        mesaId: Number(id),
        itens: { some: { status: { in: ["PENDENTE", "PREPARANDO", "PRONTO"] } } },
      },
      include: {
        itens: {
          include: { produto: { select: { nome: true } } },
          orderBy: { criadoEm: "asc" },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(pedidos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
