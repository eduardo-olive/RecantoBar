import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

export async function POST(request: Request) {
  try {
    const { itens, metodoPagamento, mesaId, comandaId } = await request.json();

    await prisma.$transaction(async (tx) => {
      let totalVenda = 0;

      // Buscar info de requerPreparo dos produtos quando tem mesa
      let produtosInfo: Record<string, { requerPreparo: boolean }> = {};
      if (mesaId || comandaId) {
        const produtoIds = itens.map((i: any) => i.produtoId);
        const produtos = await tx.produto.findMany({
          where: { id: { in: produtoIds } },
          select: { id: true, requerPreparo: true },
        });
        produtosInfo = Object.fromEntries(produtos.map((p) => [p.id, { requerPreparo: p.requerPreparo }]));
      }

      // Buscar numero da mesa
      let mesaNumero: number | null = null;
      let mesaIdReal = mesaId ? Number(mesaId) : null;

      if (comandaId && !mesaIdReal) {
        const comanda = await tx.comanda.findUnique({ where: { id: comandaId } });
        if (comanda) mesaIdReal = comanda.mesaId;
      }

      if (mesaIdReal) {
        const mesa = await tx.mesa.findUnique({ where: { id: mesaIdReal } });
        if (mesa) mesaNumero = mesa.numero;
      }

      // Calcular total
      for (const item of itens) {
        totalVenda += Number(item.total);
      }

      // === FLUXO COMANDA: sem pagamento agora ===
      if (comandaId) {
        // Apenas baixar estoque
        for (const item of itens) {
          await tx.produto.update({
            where: { id: item.produtoId },
            data: { estoque: { decrement: Number(item.qtd) } },
          });
        }

        // Criar pedido vinculado à comanda (pago: false)
        await tx.pedido.create({
          data: {
            mesaId: mesaIdReal,
            comandaId,
            metodoPagamento: null,
            valorTotal: totalVenda,
            pago: false,
            itens: {
              create: itens.map((item: any) => {
                const requer = produtosInfo[item.produtoId]?.requerPreparo ?? false;
                return {
                  produtoId: item.produtoId,
                  quantidade: Number(item.qtd),
                  precoUnit: Number(item.total) / Number(item.qtd),
                  subtotal: Number(item.total),
                  status: requer ? "PENDENTE" : "ENTREGUE",
                  mesaNumero,
                };
              }),
            },
          },
        });

        // NÃO cria Movimentacao financeira
        // NÃO atualiza caixa
        // Pagamento será feito ao fechar a comanda

        return; // Sai da transaction
      }

      // === FLUXO NORMAL: pagamento na hora ===
      const caixa = await getCaixaAberto();

      for (const item of itens) {
        const valor = Number(item.total);

        await tx.movimentacao.create({
          data: {
            tipo: "SAIDA",
            categoria: "VENDA",
            valor,
            desc: `VENDA PDV: ${item.qtd}x ${item.nome}${mesaNumero ? ` (Mesa ${mesaNumero})` : ""}`,
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

      // Se tem mesa (sem comanda), criar Pedido pago
      if (mesaIdReal) {
        await tx.pedido.create({
          data: {
            mesaId: mesaIdReal,
            metodoPagamento,
            valorTotal: totalVenda,
            pago: true,
            itens: {
              create: itens.map((item: any) => {
                const requer = produtosInfo[item.produtoId]?.requerPreparo ?? false;
                return {
                  produtoId: item.produtoId,
                  quantidade: Number(item.qtd),
                  precoUnit: Number(item.total) / Number(item.qtd),
                  subtotal: Number(item.total),
                  status: requer ? "PENDENTE" : "ENTREGUE",
                  mesaNumero,
                };
              }),
            },
          },
        });

        // Marcar mesa como OCUPADA
        await tx.mesa.update({
          where: { id: mesaIdReal },
          data: { status: "OCUPADA" },
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (_error: any) {
    console.error("Erro na venda:", _error);
    return NextResponse.json({ error: _error.message }, { status: 500 });
  }
}
