import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCaixaAberto } from "@/lib/caixa";

export async function POST(request: Request) {
  try {
    const { valor, motivo } = await request.json();
    if (!valor || valor <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    const caixa = await requireCaixaAberto();

    const [movimentacao] = await prisma.$transaction([
      prisma.movimentacao.create({
        data: {
          tipo: "SAIDA",
          categoria: "SUPRIMENTO",
          valor: Number(valor),
          desc: `SUPRIMENTO: ${motivo || "Adição ao caixa"}`,
          caixaId: caixa.id,
        },
      }),
      prisma.caixa.update({
        where: { id: caixa.id },
        data: { valor_atual: { increment: Number(valor) } },
      }),
    ]);

    return NextResponse.json(movimentacao, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("Nenhum caixa") ? 400 : 500;
    return NextResponse.json({ error: error.message || "Erro no suprimento" }, { status });
  }
}
