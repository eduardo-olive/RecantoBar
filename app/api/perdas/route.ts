import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

// GET - Listar perdas
export async function GET() {
  try {
    const perdas = await prisma.perda.findMany({
      orderBy: { data: "desc" },
      include: { produto: { select: { nome: true, precoCusto: true } } },
    });
    return NextResponse.json(perdas);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar perdas" }, { status: 500 });
  }
}

// POST - Registrar perda com impacto financeiro
export async function POST(request: Request) {
  try {
    const { produtoId, qtd, motivo } = await request.json();
    if (!produtoId || !qtd || !motivo) {
      return NextResponse.json({ error: "Campos obrigatórios: produtoId, qtd, motivo" }, { status: 400 });
    }

    const caixa = await getCaixaAberto();

    const result = await prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({ where: { id: produtoId } });
      if (!produto) throw new Error("Produto não encontrado");

      if (produto.estoque < qtd) throw new Error("Estoque insuficiente para registrar perda");

      const valorPerda = produto.precoCusto * Number(qtd);

      // Cria movimentacao financeira da perda
      const movimentacao = await tx.movimentacao.create({
        data: {
          tipo: "ENTRADA",
          categoria: "PERDA",
          valor: valorPerda,
          desc: `PERDA: ${qtd}x ${produto.nome} - ${motivo}`,
          caixaId: caixa?.id || null,
        },
      });

      // Registra a perda vinculada a movimentacao
      const perda = await tx.perda.create({
        data: {
          produtoId,
          qtd: Number(qtd),
          motivo,
          movimentacaoId: movimentacao.id,
        },
      });

      // Baixa o estoque
      await tx.produto.update({
        where: { id: produtoId },
        data: { estoque: { decrement: Number(qtd) } },
      });

      // Atualiza o caixa (perda = prejuizo)
      if (caixa) {
        await tx.caixa.update({
          where: { id: caixa.id },
          data: { valor_atual: { decrement: valorPerda } },
        });
      }

      return { perda, movimentacao, valorPerda };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao registrar perda" }, { status: 500 });
  }
}
