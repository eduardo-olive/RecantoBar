import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

export async function POST(request: Request) {
  try {
    const { itens, metodoPagamento } = await request.json();
    const caixa = await getCaixaAberto();

    await prisma.$transaction(async (tx) => {
      let totalVenda = 0;

      for (const item of itens) {
        const valor = Number(item.total);
        totalVenda += valor;

        await tx.movimentacao.create({
          data: {
            tipo: "SAIDA",
            categoria: "VENDA",
            valor: valor,
            desc: `VENDA PDV: ${item.qtd}x ${item.nome}`,
            pagamento: metodoPagamento,
            caixaId: caixa?.id || null,
          },
        });

        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: Number(item.qtd) } },
        });
      }

      // Atualiza saldo do caixa
      if (caixa) {
        await tx.caixa.update({
          where: { id: caixa.id },
          data: { valor_atual: { increment: totalVenda } },
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (_error: any) {
    console.error("Erro na venda:", _error);
    return NextResponse.json({ error: _error.message }, { status: 500 });
  }
}
