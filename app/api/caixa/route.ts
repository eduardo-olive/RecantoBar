import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Lista historico de caixas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const caixas = await prisma.caixa.findMany({
      where,
      orderBy: { data_abertura: "desc" },
      include: {
        _count: { select: { movimentacoes: true } },
      },
    });

    return NextResponse.json(caixas);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar caixas" }, { status: 500 });
  }
}
