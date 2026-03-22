import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: any = {};
    if (body.nome) data.nome = body.nome;
    if (body.email) data.email = body.email;
    if (body.perfilId) data.perfilId = body.perfilId;
    if (typeof body.ativo === "boolean") data.ativo = body.ativo;
    if (body.senha) data.senhaHash = await hashPassword(body.senha);

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      include: { perfil: { select: { nome: true } } },
    });

    return NextResponse.json(usuario);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.usuario.update({
      where: { id },
      data: { ativo: false },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
