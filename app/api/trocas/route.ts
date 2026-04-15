import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    const where: any = {};
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        where.data.lte = fim;
      }
    }

    const trocas = await prisma.troca.findMany({
      where,
      include: {
        produtoOriginal: { select: { nome: true } },
        produtoNovo: { select: { nome: true } },
      },
      orderBy: { data: "desc" },
    });

    return NextResponse.json(trocas);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar trocas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      pedidoItemId,
      qtdDevolvida,
      produtoNovoId,
      qtdNova,
      resolucaoDiferenca,
      metodoPagamento,
      motivo,
    } = await request.json();

    // Validações básicas
    if (!pedidoItemId || !qtdDevolvida || qtdDevolvida <= 0) {
      return NextResponse.json({ error: "Item e quantidade são obrigatórios" }, { status: 400 });
    }

    // Buscar item original com pedido
    const itemOriginal = await prisma.pedidoItem.findUnique({
      where: { id: pedidoItemId },
      include: {
        pedido: true,
        produto: true,
      },
    });

    if (!itemOriginal) {
      return NextResponse.json({ error: "Item do pedido não encontrado" }, { status: 404 });
    }

    // Validar mesmo dia
    const hoje = new Date();
    const dataPedido = new Date(itemOriginal.pedido.criadoEm);
    if (
      dataPedido.getFullYear() !== hoje.getFullYear() ||
      dataPedido.getMonth() !== hoje.getMonth() ||
      dataPedido.getDate() !== hoje.getDate()
    ) {
      return NextResponse.json({ error: "Trocas só são permitidas no mesmo dia da compra" }, { status: 400 });
    }

    // Validar quantidade
    if (qtdDevolvida > itemOriginal.quantidade) {
      return NextResponse.json({ error: "Quantidade devolvida maior que a comprada" }, { status: 400 });
    }

    // Calcular valores
    const valorOriginal = qtdDevolvida * itemOriginal.precoUnit;
    let valorNovo = 0;
    let produtoNovo = null;

    if (produtoNovoId) {
      produtoNovo = await prisma.produto.findUnique({ where: { id: produtoNovoId } });
      if (!produtoNovo) {
        return NextResponse.json({ error: "Produto novo não encontrado" }, { status: 404 });
      }
      const qtdNovaReal = qtdNova || qtdDevolvida;
      if (produtoNovo.estoque < qtdNovaReal) {
        return NextResponse.json({ error: `Estoque insuficiente de ${produtoNovo.nome}` }, { status: 400 });
      }
      valorNovo = qtdNovaReal * produtoNovo.precoVenda;
    }

    const diferenca = valorNovo - valorOriginal; // positivo=cobrar, negativo=devolver
    const qtdNovaFinal = produtoNovoId ? (qtdNova || qtdDevolvida) : 0;

    // Validar resolução se há diferença
    if (Math.abs(diferenca) > 0.01 && !resolucaoDiferenca) {
      return NextResponse.json({ error: "Informe como resolver a diferença de valor" }, { status: 400 });
    }

    // Validar método de pagamento quando necessário
    if (diferenca > 0.01 && resolucaoDiferenca === "COBRADO" && !metodoPagamento) {
      return NextResponse.json({ error: "Informe o método de pagamento para a diferença" }, { status: 400 });
    }

    const caixa = await getCaixaAberto();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Devolver estoque do produto original
      await tx.produto.update({
        where: { id: itemOriginal.produtoId },
        data: { estoque: { increment: qtdDevolvida } },
      });

      // 2. Criar movimentação de estorno (dinheiro saindo = ENTRADA na convenção do sistema)
      const movEstorno = await tx.movimentacao.create({
        data: {
          tipo: "ENTRADA",
          categoria: "TROCA",
          valor: valorOriginal,
          desc: `TROCA (ESTORNO): ${qtdDevolvida}x ${itemOriginal.produto.nome}`,
          caixaId: caixa?.id || null,
        },
      });

      // Decrementar caixa pelo valor estornado
      if (caixa) {
        await tx.caixa.update({
          where: { id: caixa.id },
          data: { valor_atual: { decrement: valorOriginal } },
        });
      }

      let movNova = null;

      // 3. Se tem produto novo, baixar estoque e criar movimentação de nova venda
      if (produtoNovoId && produtoNovo) {
        await tx.produto.update({
          where: { id: produtoNovoId },
          data: { estoque: { decrement: qtdNovaFinal } },
        });

        movNova = await tx.movimentacao.create({
          data: {
            tipo: "SAIDA",
            categoria: "TROCA",
            valor: valorNovo,
            desc: `TROCA (NOVO): ${qtdNovaFinal}x ${produtoNovo.nome}`,
            pagamento: diferenca > 0.01 ? metodoPagamento : null,
            caixaId: caixa?.id || null,
          },
        });

        // Incrementar caixa pelo valor do novo item
        if (caixa) {
          await tx.caixa.update({
            where: { id: caixa.id },
            data: { valor_atual: { increment: valorNovo } },
          });
        }
      }

      // 4. Se diferença negativa e DEVOLVIDO, devolver dinheiro do caixa
      if (diferenca < -0.01 && resolucaoDiferenca === "DEVOLVIDO" && !produtoNovoId) {
        // Já foi decrementado no estorno acima, nada a fazer
      }

      // 5. Criar registro da troca
      const troca = await tx.troca.create({
        data: {
          pedidoItemOriginalId: pedidoItemId,
          produtoOriginalId: itemOriginal.produtoId,
          qtdDevolvida,
          produtoNovoId: produtoNovoId || null,
          qtdNova: qtdNovaFinal,
          valorOriginal,
          valorNovo,
          diferenca,
          resolucaoDiferenca: Math.abs(diferenca) <= 0.01 ? null : resolucaoDiferenca,
          metodoPagamento: diferenca > 0.01 ? metodoPagamento : null,
          motivo: motivo || null,
          movEstornoId: movEstorno.id,
          movNovaId: movNova?.id || null,
          caixaId: caixa?.id || null,
        },
      });

      return troca;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Erro na troca:", error);
    return NextResponse.json({ error: error.message || "Erro ao registrar troca" }, { status: 500 });
  }
}
