import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar contas com filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const status = searchParams.get("status");

    const where: any = {};
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;

    const contas = await prisma.contaPagarReceber.findMany({
      where,
      orderBy: { dataVencimento: "asc" },
    });

    // Resumo
    const pendentes = await prisma.contaPagarReceber.aggregate({
      where: { status: "PENDENTE", tipo: "PAGAR" },
      _sum: { valor: true },
    });
    const receber = await prisma.contaPagarReceber.aggregate({
      where: { status: "PENDENTE", tipo: "RECEBER" },
      _sum: { valor: true },
    });

    return NextResponse.json({
      contas,
      resumo: {
        totalPagar: pendentes._sum.valor || 0,
        totalReceber: receber._sum.valor || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar contas" }, { status: 500 });
  }
}

// POST - Criar nova conta
export async function POST(request: Request) {
  try {
    const { tipo, descricao, valor, dataVencimento, categoria } = await request.json();
    if (!tipo || !descricao || !valor || !dataVencimento) {
      return NextResponse.json({ error: "Campos obrigatórios: tipo, descricao, valor, dataVencimento" }, { status: 400 });
    }

    const conta = await prisma.contaPagarReceber.create({
      data: {
        tipo,
        descricao,
        valor: Number(valor),
        dataVencimento: new Date(dataVencimento),
        categoria: categoria || null,
      },
    });

    return NextResponse.json(conta, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao criar conta" }, { status: 500 });
  }
}
