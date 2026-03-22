import { prisma } from "./prisma";

export async function getCaixaAberto() {
  const caixa = await prisma.caixa.findFirst({
    where: { status: "aberto" },
    orderBy: { data_abertura: "desc" },
  });
  return caixa;
}

export async function requireCaixaAberto() {
  const caixa = await getCaixaAberto();
  if (!caixa) {
    throw new Error("Nenhum caixa aberto. Abra o caixa antes de continuar.");
  }
  return caixa;
}
