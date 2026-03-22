import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const perfis = await prisma.perfil.findMany({
      include: { _count: { select: { usuarios: true } } },
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(perfis);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar perfis" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nome, permissoes } = await request.json();
    if (!nome || !permissoes) {
      return NextResponse.json({ error: "Nome e permissões são obrigatórios" }, { status: 400 });
    }

    const perfil = await prisma.perfil.create({
      data: { nome, permissoes },
    });

    return NextResponse.json(perfil, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
