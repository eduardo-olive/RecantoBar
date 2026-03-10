-- CreateTable
CREATE TABLE "caixas" (
    "id" SERIAL NOT NULL,
    "valor_inicial" DECIMAL(10,2) NOT NULL,
    "valor_atual" DECIMAL(10,2) NOT NULL,
    "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'aberto',

    CONSTRAINT "caixas_pkey" PRIMARY KEY ("id")
);