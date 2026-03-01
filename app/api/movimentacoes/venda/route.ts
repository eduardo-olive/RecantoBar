import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ItemVenda {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
}

export async function POST(request: Request) {
  try {
    const { itens, metodoPagamento } = await request.json();

    await prisma.$transaction(async (tx) => {
      for (const item of itens) {
        // 1. REGISTRO FINANCEIRO
        // Usamos seu schema: desc, pagamento, tipo, valor
        await tx.movimentacao.create({
          data: {
            tipo: "SAIDA", // Registro de saída de mercadoria (entrada de caixa)
            valor: Number(item.total),
            desc: `VENDA PDV: ${item.qtd}x ${item.nome}`,
            pagamento: metodoPagamento,
          }
        });

        // 2. ATUALIZA O ESTOQUE DO PRODUTO
        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            estoque: { decrement: Number(item.qtd) }
          }
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (_error: any) {
    console.error("Erro na venda:", _error);
    return NextResponse.json({ error: _error.message }, { status: 500 });
  }
}