import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Retorna todas as categorias do banco
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { produtos: true }, // Retorna quantos produtos existem na categoria
        },
      },
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

// POST: Cria uma nova categoria
export async function POST(req: Request) {
  try {
    const { nome } = await req.json();

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const novaCategoria = await prisma.categoria.create({
      data: { nome },
    });

    return NextResponse.json(novaCategoria);
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
  }
}