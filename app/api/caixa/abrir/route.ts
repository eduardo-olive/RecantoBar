import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

// GET - Retorna o caixa aberto atual
export async function GET() {
  try {
    const caixa = await getCaixaAberto();
    if (!caixa) {
      return NextResponse.json({ error: "Nenhum caixa aberto" }, { status: 404 });
    }
    return NextResponse.json(caixa);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar caixa" }, { status: 500 });
  }
}

// POST - Abre um novo caixa (fecha o anterior se existir)
export async function POST(request: Request) {
  try {
    const { valor } = await request.json();

    // Fecha qualquer caixa que esteja aberto
    const caixaAberto = await getCaixaAberto();
    if (caixaAberto) {
      await prisma.caixa.update({
        where: { id: caixaAberto.id },
        data: {
          status: "fechado",
          data_fechamento: new Date(),
        },
      });
    }

    const novoCaixa = await prisma.caixa.create({
      data: {
        valor_inicial: valor,
        valor_atual: valor,
      },
    });

    return NextResponse.json(novoCaixa);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao abrir caixa" }, { status: 500 });
  }
}
