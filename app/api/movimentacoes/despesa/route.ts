import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

export async function POST(request: Request) {
  try {
    const { valor, descricao, subcategoria } = await request.json();
    if (!valor || valor <= 0 || !descricao) {
      return NextResponse.json({ error: "Valor e descrição são obrigatórios" }, { status: 400 });
    }

    const caixa = await getCaixaAberto();

    const result = await prisma.$transaction(async (tx) => {
      const movimentacao = await tx.movimentacao.create({
        data: {
          tipo: "ENTRADA",
          categoria: "DESPESA",
          subcategoria: subcategoria || "OUTROS",
          valor: Number(valor),
          desc: `DESPESA (${subcategoria || "OUTROS"}): ${descricao}`,
          caixaId: caixa?.id || null,
        },
      });

      if (caixa) {
        await tx.caixa.update({
          where: { id: caixa.id },
          data: { valor_atual: { decrement: Number(valor) } },
        });
      }

      return movimentacao;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao registrar despesa" }, { status: 500 });
  }
}
