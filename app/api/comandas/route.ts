import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — listar comandas (filtro por mesaId, status)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mesaId = searchParams.get("mesaId");
    const status = searchParams.get("status");

    const where: any = {};
    if (mesaId) where.mesaId = Number(mesaId);
    if (status) where.status = status;

    const comandas = await prisma.comanda.findMany({
      where,
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
      orderBy: { dataAbertura: "desc" },
    });

    return NextResponse.json(comandas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — abrir comanda para uma mesa
export async function POST(request: Request) {
  try {
    const { mesaId, clienteNome } = await request.json();

    if (!mesaId) {
      return NextResponse.json({ error: "mesaId é obrigatório" }, { status: 400 });
    }

    // Verificar se mesa existe
    const mesa = await prisma.mesa.findUnique({ where: { id: Number(mesaId) } });
    if (!mesa) {
      return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
    }

    // Verificar se já tem comanda aberta nessa mesa
    const comandaAberta = await prisma.comanda.findFirst({
      where: { mesaId: Number(mesaId), status: "ABERTA" },
    });
    if (comandaAberta) {
      return NextResponse.json({ error: "Essa mesa já tem uma comanda aberta" }, { status: 400 });
    }

    const comanda = await prisma.$transaction(async (tx) => {
      // Criar comanda
      const novaComanda = await tx.comanda.create({
        data: {
          mesaId: Number(mesaId),
          clienteNome: clienteNome || null,
        },
      });

      // Marcar mesa como OCUPADA
      await tx.mesa.update({
        where: { id: Number(mesaId) },
        data: { status: "OCUPADA" },
      });

      return novaComanda;
    });

    return NextResponse.json(comanda, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
