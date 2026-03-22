import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

// POST - Cria perfis e usuario admin inicial (usar uma vez, depois remover)
export async function POST() {
  try {
    // Verificar se ja existe admin
    const adminExistente = await prisma.usuario.findFirst({
      where: { perfil: { nome: "ADMIN" } },
    });
    if (adminExistente) {
      return NextResponse.json({ error: "Admin ja existe" }, { status: 400 });
    }

    // Criar perfis
    const perfilAdmin = await prisma.perfil.upsert({
      where: { nome: "ADMIN" },
      update: {},
      create: {
        nome: "ADMIN",
        permissoes: ["vendas", "caixa", "estoque", "financeiro", "relatorios", "admin", "usuarios"],
      },
    });

    const perfilOperador = await prisma.perfil.upsert({
      where: { nome: "OPERADOR" },
      update: {},
      create: {
        nome: "OPERADOR",
        permissoes: ["vendas", "caixa", "estoque"],
      },
    });

    const perfilCaixa = await prisma.perfil.upsert({
      where: { nome: "CAIXA" },
      update: {},
      create: {
        nome: "CAIXA",
        permissoes: ["vendas", "caixa"],
      },
    });

    // Criar usuario admin
    const senhaHash = await hashPassword("admin123");
    const admin = await prisma.usuario.create({
      data: {
        nome: "Administrador",
        email: "admin@recanto.com",
        senhaHash,
        perfilId: perfilAdmin.id,
      },
    });

    return NextResponse.json({
      message: "Seed executado com sucesso!",
      admin: { email: admin.email, senha: "admin123" },
      perfis: [perfilAdmin.nome, perfilOperador.nome, perfilCaixa.nome],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
