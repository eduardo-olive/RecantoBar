import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: any = {};
    if (body.numero !== undefined) data.numero = Number(body.numero);
    if (body.nome !== undefined) data.nome = body.nome || null;
    if (body.capacidade !== undefined) data.capacidade = Number(body.capacidade);
    if (body.status !== undefined) data.status = body.status;
    if (body.ativa !== undefined) data.ativa = body.ativa;

    const mesa = await prisma.mesa.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json(mesa);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Já existe uma mesa com esse número" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.mesa.update({
      where: { id: Number(id) },
      data: { ativa: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
