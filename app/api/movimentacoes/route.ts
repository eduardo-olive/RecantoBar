import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const movimentacoes = await prisma.movimentacao.findMany({
      orderBy: {
        data: 'desc', // As mais recentes primeiro
      },
    });

    return NextResponse.json(movimentacoes);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    return NextResponse.json({ error: "Erro ao buscar movimentações" }, { status: 500 });
  }
}