import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { nome, permissoes } = await request.json();

    const perfil = await prisma.perfil.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(permissoes && { permissoes }),
      },
    });

    return NextResponse.json(perfil);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const count = await prisma.usuario.count({ where: { perfilId: id } });
    if (count > 0) {
      return NextResponse.json({ error: "Não é possível excluir perfil com usuários vinculados" }, { status: 400 });
    }

    await prisma.perfil.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
