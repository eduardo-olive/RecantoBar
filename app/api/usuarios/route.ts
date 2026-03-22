import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { perfil: { select: { id: true, nome: true } } },
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar usuários" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nome, email, senha, perfilId } = await request.json();
    if (!nome || !email || !senha || !perfilId) {
      return NextResponse.json({ error: "Campos obrigatórios: nome, email, senha, perfilId" }, { status: 400 });
    }

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const senhaHash = await hashPassword(senha);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senhaHash, perfilId },
      include: { perfil: { select: { nome: true } } },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
