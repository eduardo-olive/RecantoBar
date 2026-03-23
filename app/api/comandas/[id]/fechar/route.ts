import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCaixaAberto } from "@/lib/caixa";

// POST — fechar comanda com pagamentos (pode dividir em métodos diferentes)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { pagamentos } = await request.json();

    if (!pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
      return NextResponse.json({ error: "Informe pelo menos um pagamento" }, { status: 400 });
    }

    // Buscar comanda com pedidos
    const comanda = await prisma.comanda.findUnique({
      where: { id },
      include: {
        mesa: true,
        pedidos: {
          where: { pago: false },
          include: { itens: true },
        },
      },
    });

    if (!comanda) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 });
    }

    if (comanda.status !== "ABERTA") {
      return NextResponse.json({ error: "Comanda já está fechada" }, { status: 400 });
    }

    // Calcular total da comanda
    const totalComanda = comanda.pedidos.reduce((acc, p) => acc + p.valorTotal, 0);

    // Validar soma dos pagamentos
    const totalPagamentos = pagamentos.reduce((acc: number, p: any) => acc + Number(p.valor), 0);
    const diff = Math.abs(totalComanda - totalPagamentos);
    if (diff > 0.01) {
      return NextResponse.json({
        error: `Total dos pagamentos (R$ ${totalPagamentos.toFixed(2)}) difere do total da comanda (R$ ${totalComanda.toFixed(2)})`,
      }, { status: 400 });
    }

    const caixa = await getCaixaAberto();

    await prisma.$transaction(async (tx) => {
      // Para cada pagamento, criar Movimentacao + ComandaPagamento
      for (const pgto of pagamentos) {
        const valor = Number(pgto.valor);
        const metodo = pgto.metodoPagamento;

        const movimentacao = await tx.movimentacao.create({
          data: {
            tipo: "SAIDA",
            categoria: "VENDA",
            valor,
            desc: `COMANDA Mesa ${comanda.mesa.numero} — ${metodo}`,
            pagamento: metodo,
            caixaId: caixa?.id || null,
          },
        });

        await tx.comandaPagamento.create({
          data: {
            comandaId: id,
            valor,
            metodoPagamento: metodo,
            movimentacaoId: movimentacao.id,
          },
        });
      }

      // Atualizar saldo do caixa
      if (caixa) {
        await tx.caixa.update({
          where: { id: caixa.id },
          data: { valor_atual: { increment: totalComanda } },
        });
      }

      // Marcar pedidos como pagos
      for (const pedido of comanda.pedidos) {
        await tx.pedido.update({
          where: { id: pedido.id },
          data: { pago: true },
        });
      }

      // Fechar comanda
      await tx.comanda.update({
        where: { id },
        data: { status: "FECHADA", dataFechamento: new Date() },
      });

      // Liberar mesa
      const outrasAbertas = await tx.comanda.count({
        where: { mesaId: comanda.mesaId, status: "ABERTA", id: { not: id } },
      });
      if (outrasAbertas === 0) {
        await tx.mesa.update({
          where: { id: comanda.mesaId },
          data: { status: "LIVRE" },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao fechar comanda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
