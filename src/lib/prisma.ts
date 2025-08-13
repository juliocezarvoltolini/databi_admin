// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma/client";

// Singleton para evitar múltiplas conexões
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Função para criar cliente Prisma com tratamento de erro
function createPrismaClient() {
  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("❌ Erro ao criar cliente Prisma:", error);
    console.error("💡 Execute: npx prisma generate");
    throw new Error(
      'Prisma client not generated. Run "npx prisma generate" first.'
    );
  }
}

// Inicializar cliente com verificação
let prisma: PrismaClient;

try {
  prisma = globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} catch (error) {
  console.error("❌ Falha na inicialização do Prisma:", error);
  // Em desenvolvimento, re-throw o erro para mostrar claramente o problema
  if (process.env.NODE_ENV === "development") {
    throw error;
  }
  // Em produção, criar um cliente mock para evitar crash total
  prisma = {} as PrismaClient;
}

export { prisma };
