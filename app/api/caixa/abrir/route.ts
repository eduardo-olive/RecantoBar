import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { valor } = await request.json();

    const novoCaixa = await prisma.caixas.create({
      data: {
        valor_inicial: valor,
        valor_atual: valor, // No início, o atual é igual ao inicial
      },
    });

    return NextResponse.json(novoCaixa);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao abrir caixa" }, { status: 500 });
  }
}