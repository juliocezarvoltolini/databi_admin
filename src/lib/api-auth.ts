// src/lib/api-auth.ts
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UserSession } from "@/lib/types";

export interface AuthenticatedRequest extends NextRequest {
  user: UserSession;
}

/**
 * Middleware de autenticação para rotas API
 * Verifica o token JWT e retorna os dados do usuário
 */
export async function authenticateApiRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: UserSession;
  error?: string;
  status?: number;
}> {
  try {
    // 1. Tentar obter token do cookie (navegador)
    let token = request.cookies.get("auth-token")?.value;
    
    // 2. Se não houver cookie, tentar header Authorization (APIs/mobile)
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // 3. Para desenvolvimento/testes, permitir header x-user-id
    if (!token && process.env.NODE_ENV === "development") {
      const testUserId = request.headers.get("x-user-id");
      if (testUserId) {
        // Buscar usuário diretamente para desenvolvimento
        const { getCurrentUser } = await import("@/lib/auth");
        const user = await getCurrentUser(testUserId);
        console.log(`api=auth user ${JSON.stringify(user)}`)
        if (user && user.isActive) {
          return {
            success: true,
            user: {
              userId: user.id,
              email: user.email,
              name: user.name,
              companyId: user.companyId,
              profileId: user.profileId,
            },
          };
        }
      }
    }

    if (!token) {
      return {
        success: false,
        error: "Token de autenticação não fornecido",
        status: 401,
      };
    }

    // 4. Verificar token
    const user = await verifyToken(token);
    if (!user) {
      return {
        success: false,
        error: "Token inválido ou expirado",
        status: 401,
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Erro na autenticação da API:", error);
    return {
      success: false,
      error: "Erro interno de autenticação",
      status: 500,
    };
  }
}

/**
 * Helper para criar resposta de erro de autenticação
 */
export function createAuthErrorResponse(error: string, status: number = 401) {
  return Response.json(
    {
      success: false,
      error,
    },
    { status }
  );
}