import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const produtosCriticos = await prisma.produto.findMany({
      where: {
        estoque: {
          lt: prisma.produto.fields.estoqueMinimo // estoque < estoqueMinimo
        }
      },
      orderBy: {
        estoque: 'asc' // Os mais urgentes primeiro
      }
    });

    return NextResponse.json(produtosCriticos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar estoque crítico" }, { status: 500 });
  }
}