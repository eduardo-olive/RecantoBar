import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mesas = await prisma.mesa.findMany({
      where: { ativa: true },
      orderBy: { numero: "asc" },
    });
    return NextResponse.json(mesas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { numero, nome, capacidade, lote } = await request.json();

    // Criação em lote: { lote: { de: 1, ate: 20 }, capacidade: 4 }
    if (lote) {
      const de = Number(lote.de);
      const ate = Number(lote.ate);

      if (!de || !ate || de > ate) {
        return NextResponse.json({ error: "Intervalo inválido" }, { status: 400 });
      }

      if (ate - de + 1 > 100) {
        return NextResponse.json({ error: "Máximo de 100 mesas por vez" }, { status: 400 });
      }

      const criadas: number[] = [];
      const ignoradas: number[] = [];

      for (let n = de; n <= ate; n++) {
        const existente = await prisma.mesa.findUnique({ where: { numero: n } });

        if (existente && existente.ativa) {
          ignoradas.push(n);
          continue;
        }

        if (existente && !existente.ativa) {
          await prisma.mesa.update({
            where: { id: existente.id },
            data: {
              capacidade: capacidade ? Number(capacidade) : 4,
              status: "LIVRE",
              ativa: true,
            },
          });
        } else {
          await prisma.mesa.create({
            data: { numero: n, capacidade: capacidade ? Number(capacidade) : 4 },
          });
        }
        criadas.push(n);
      }

      return NextResponse.json(
        { criadas: criadas.length, ignoradas: ignoradas.length },
        { status: 201 }
      );
    }

    // Criação individual
    if (!numero) {
      return NextResponse.json({ error: "Número da mesa é obrigatório" }, { status: 400 });
    }

    // Verificar se existe mesa desativada com o mesmo número
    const mesaExistente = await prisma.mesa.findUnique({
      where: { numero: Number(numero) },
    });

    if (mesaExistente && !mesaExistente.ativa) {
      const mesaReativada = await prisma.mesa.update({
        where: { id: mesaExistente.id },
        data: {
          nome: nome || null,
          capacidade: capacidade ? Number(capacidade) : 4,
          status: "LIVRE",
          ativa: true,
        },
      });
      return NextResponse.json(mesaReativada, { status: 201 });
    }

    const mesa = await prisma.mesa.create({
      data: {
        numero: Number(numero),
        nome: nome || null,
        capacidade: capacidade ? Number(capacidade) : 4,
      },
    });

    return NextResponse.json(mesa, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Já existe uma mesa com esse número" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
