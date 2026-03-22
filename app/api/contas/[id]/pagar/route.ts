import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

// POST - Marcar conta como paga e gerar movimentacao
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const conta = await prisma.contaPagarReceber.findUnique({ where: { id } });

    if (!conta) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    if (conta.status !== "PENDENTE") return NextResponse.json({ error: "Conta já processada" }, { status: 400 });

    const caixa = await getCaixaAberto();

    const result = await prisma.$transaction(async (tx) => {
      // Cria movimentacao
      const movimentacao = await tx.movimentacao.create({
        data: {
          tipo: conta.tipo === "PAGAR" ? "ENTRADA" : "SAIDA",
          categoria: "DESPESA",
          subcategoria: conta.categoria || "CONTA",
          valor: conta.valor,
          desc: `${conta.tipo === "PAGAR" ? "PGT" : "REC"} CONTA: ${conta.descricao}`,
          caixaId: caixa?.id || null,
        },
      });

      // Atualiza conta
      const contaAtualizada = await tx.contaPagarReceber.update({
        where: { id },
        data: {
          status: "PAGO",
          dataPagamento: new Date(),
          movimentacaoId: movimentacao.id,
        },
      });

      // Atualiza caixa
      if (caixa) {
        if (conta.tipo === "PAGAR") {
          await tx.caixa.update({
            where: { id: caixa.id },
            data: { valor_atual: { decrement: conta.valor } },
          });
        } else {
          await tx.caixa.update({
            where: { id: caixa.id },
            data: { valor_atual: { increment: conta.valor } },
          });
        }
      }

      return contaAtualizada;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao pagar conta" }, { status: 500 });
  }
}
