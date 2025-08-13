// src/app/api/permissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { type ApiResponse } from "@/lib/types";
import {
  authenticateApiRequest,
  createAuthErrorResponse,
} from "@/lib/api-auth";

// GET - Listar todas as permissões disponíveis
export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para visualizar perfis (necessário para ver permissões)
    const canViewProfiles = await hasPermission(user.userId, "VIEW_PROFILES");
    if (!canViewProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar permissões",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const permissoesDoPerfil = await prisma.profilePermission.findMany({
      where: { profileId: user.profileId },
    });

    const permissoesID = permissoesDoPerfil.reduce((acc, current) => {
      acc.add(current.permissionId);
      return acc;
    }, new Set<string>());  

    // Buscar todas as permissões
    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: [...permissoesID] },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: permissions,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao listar permissões:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
