import { PrismaClient } from '@prisma/client'
import path from 'path'

const prismaClientSingleton = () => {
  // Pegamos o caminho absoluto da pasta onde o projeto está rodando
  const dbPath = path.join(process.cwd(), 'prisma', 'planalto.db')
  
  return new PrismaClient()
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma