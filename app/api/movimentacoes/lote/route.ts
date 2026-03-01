import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ItemEstoque {
  produtoId: string;
  qtd: number;
  precoCusto: number;
  precoVenda: number;
}

export async function POST(request: Request) {
  try {
    const carrinho = await request.json();

    // Iniciamos a transação para garantir que o estoque e o financeiro fiquem sincronizados
    await prisma.$transaction(async (tx) => {
      for (const item of carrinho) {
        
        // 1. REGISTRO NA TABELA MOVIMENTACAO
        // Usamos apenas os campos que existem no seu schema.prisma
        await tx.movimentacao.create({
          data: {
            tipo: "ENTRADA",
            valor: Number((item.precoCusto * item.qtd).toFixed(2)),
            // Como não temos 'produtoId' na Movimentacao, guardamos o rastro no 'desc'
            desc: `COMPRA: ${item.qtd}x ${item.nome} (Custo un: R$ ${item.precoCusto.toFixed(2)})`,
            pagamento: "ENTRADA_ESTOQUE", // Identificador para o seu financeiro
            // O campo 'data' é preenchido automaticamente pelo @default(now())
          }
        });

        // 2. ATUALIZAÇÃO NA TABELA PRODUTO
        // Aqui sim usamos o 'produtoId' para localizar e atualizar o estoque e preços
        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            estoque: { 
              increment: Number(item.qtd) 
            },
            precoCusto: Number(item.precoCusto),
            precoVenda: Number(item.precoVenda)
          }
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