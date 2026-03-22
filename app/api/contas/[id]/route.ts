import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar conta
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const conta = await prisma.contaPagarReceber.update({
      where: { id },
      data: {
        ...(body.descricao && { descricao: body.descricao }),
        ...(body.valor && { valor: Number(body.valor) }),
        ...(body.dataVencimento && { dataVencimento: new Date(body.dataVencimento) }),
        ...(body.categoria && { categoria: body.categoria }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json(conta);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao atualizar conta" }, { status: 500 });
  }
}

// DELETE - Cancelar conta
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.contaPagarReceber.update({
      where: { id },
      data: { status: "CANCELADO" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao cancelar conta" }, { status: 500 });
  }
}
