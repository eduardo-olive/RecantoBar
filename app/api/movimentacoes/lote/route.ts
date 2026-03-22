import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

export async function POST(request: Request) {
  try {
    const carrinho = await request.json();
    const caixa = await getCaixaAberto();

    await prisma.$transaction(async (tx) => {
      let totalCompra = 0;

      for (const item of carrinho) {
        const valor = Number((item.precoCusto * item.qtd).toFixed(2));
        totalCompra += valor;

        await tx.movimentacao.create({
          data: {
            tipo: "ENTRADA",
            categoria: "COMPRA",
            valor: valor,
            desc: `COMPRA: ${item.qtd}x ${item.nome} (Custo un: R$ ${item.precoCusto.toFixed(2)})`,
            pagamento: "ENTRADA_ESTOQUE",
            caixaId: caixa?.id || null,
          },
        });

        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            estoque: { increment: Number(item.qtd) },
            precoCusto: Number(item.precoCusto),
            precoVenda: Number(item.precoVenda),
          },
        });
      }

      // Atualiza saldo do caixa (compra = dinheiro saindo)
      if (caixa) {
        await tx.caixa.update({
          where: { id: caixa.id },
          data: { valor_atual: { decrement: totalCompra } },
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("ERRO NO PROCESSAMENTO:", error);
    return NextResponse.json(
      { error: "Erro de compatibilidade com o banco: " + error.message },
      { status: 500 }
    );
  }
}
