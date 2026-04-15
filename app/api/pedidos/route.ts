import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");

    const where: any = {};

    if (data) {
      const inicio = new Date(data);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(data);
      fim.setHours(23, 59, 59, 999);
      where.criadoEm = { gte: inicio, lte: fim };
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        itens: {
          include: {
            produto: { select: { id: true, nome: true } },
          },
        },
        mesa: { select: { numero: true } },
        comanda: { select: { id: true, clienteNome: true } },
      },
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}
