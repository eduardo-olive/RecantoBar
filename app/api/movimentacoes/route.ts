import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const categoria = searchParams.get("categoria");
    const caixaId = searchParams.get("caixaId");

    const where: any = {};

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        where.data.lte = fim;
      }
    }

    if (categoria) where.categoria = categoria;
    if (caixaId) where.caixaId = Number(caixaId);

    const movimentacoes = await prisma.movimentacao.findMany({
      where,
      orderBy: { data: "desc" },
    });

    return NextResponse.json(movimentacoes);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    return NextResponse.json({ error: "Erro ao buscar movimentações" }, { status: 500 });
  }
}
