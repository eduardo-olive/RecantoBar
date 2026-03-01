import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      include: { categoria: true } // Traz o nome da categoria junto
    });
    return NextResponse.json(produtos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const novoProduto = await prisma.produto.create({
      data: {
        nome: body.nome,
        precoVenda: parseFloat(body.precoVenda),
        precoCusto: parseFloat(body.precoCusto),
        estoque: parseInt(body.estoque),
        estoqueMinimo: parseInt(body.estoqueMinimo),
        estoqueSeguro: parseInt(body.estoqueSeguro),
        categoriaId: body.categoriaId
      }
    });

    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}