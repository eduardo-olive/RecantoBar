import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoriaDespesa.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar categorias de despesa" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nome } = await request.json();
    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const categoria = await prisma.categoriaDespesa.create({
      data: { nome: nome.trim().toUpperCase() },
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Categoria já existe" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao criar categoria de despesa" }, { status: 500 });
  }
}
