import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mesas = await prisma.mesa.findMany({
      where: { ativa: true },
      orderBy: { numero: "asc" },
    });
    return NextResponse.json(mesas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { numero, nome, capacidade } = await request.json();

    if (!numero) {
      return NextResponse.json({ error: "Número da mesa é obrigatório" }, { status: 400 });
    }

    // Verificar se existe mesa desativada com o mesmo número
    const mesaExistente = await prisma.mesa.findUnique({
      where: { numero: Number(numero) },
    });

    if (mesaExistente && !mesaExistente.ativa) {
      // Reativar mesa existente
      const mesaReativada = await prisma.mesa.update({
        where: { id: mesaExistente.id },
        data: {
          nome: nome || null,
          capacidade: capacidade ? Number(capacidade) : 4,
          status: "LIVRE",
          ativa: true,
        },
      });
      return NextResponse.json(mesaReativada, { status: 201 });
    }

    const mesa = await prisma.mesa.create({
      data: {
        numero: Number(numero),
        nome: nome || null,
        capacidade: capacidade ? Number(capacidade) : 4,
      },
    });

    return NextResponse.json(mesa, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Já existe uma mesa com esse número" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
