import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCaixaAberto } from "@/lib/caixa";

export async function POST(request: Request) {
  try {
    const { valor_fechamento, observacao } = await request.json();
    const caixa = await requireCaixaAberto();

    const valorAtual = Number(caixa.valor_atual);
    const valorFechamento = Number(valor_fechamento);
    const diferenca = valorFechamento - valorAtual;

    const caixaFechado = await prisma.caixa.update({
      where: { id: caixa.id },
      data: {
        status: "fechado",
        data_fechamento: new Date(),
        valor_fechamento: valorFechamento,
        diferenca: diferenca,
        observacao: observacao || null,
      },
    });

    return NextResponse.json({
      ...caixaFechado,
      resumo: {
        valor_esperado: valorAtual,
        valor_contado: valorFechamento,
        diferenca: diferenca,
      },
    });
  } catch (error: any) {
    const status = error.message?.includes("Nenhum caixa") ? 400 : 500;
    return NextResponse.json({ error: error.message || "Erro ao fechar caixa" }, { status });
  }
}
