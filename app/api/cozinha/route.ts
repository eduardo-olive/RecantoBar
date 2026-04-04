import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — itens pendentes/preparando/prontos para a cozinha
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const incluirEntregues = searchParams.get("entregues") === "true";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const statusFiltro = ["PENDENTE", "PREPARANDO", "PRONTO"];
    if (incluirEntregues) statusFiltro.push("ENTREGUE");

    const itens = await prisma.pedidoItem.findMany({
      where: {
        status: { in: statusFiltro },
        ...(incluirEntregues && { criadoEm: { gte: hoje } }),
      },
      include: {
        produto: { select: { nome: true } },
        pedido: { select: { id: true, criadoEm: true } },
      },
      orderBy: { criadoEm: "asc" },
    });

    return NextResponse.json(itens);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — atualizar status de um item (PENDENTE → PREPARANDO → PRONTO → ENTREGUE)
export async function PUT(request: Request) {
  try {
    const { itemId, status } = await request.json();

    if (!itemId || !status) {
      return NextResponse.json({ error: "itemId e status são obrigatórios" }, { status: 400 });
    }

    const statusValidos = ["PENDENTE", "PREPARANDO", "PRONTO", "ENTREGUE"];
    if (!statusValidos.includes(status)) {
      return NextResponse.json({ error: `Status inválido. Use: ${statusValidos.join(", ")}` }, { status: 400 });
    }

    const item = await prisma.pedidoItem.update({
      where: { id: itemId },
      data: { status },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
