// src/app/api/permissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { type ApiResponse } from "@/lib/types";

// GET - Listar todas as permissões disponíveis
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" } as ApiResponse,
        { status: 401 }
      );
    }

    // Verificar permissão para visualizar perfis (necessário para ver permissões)
    const canViewProfiles = await hasPermission(userId, "VIEW_PROFILES");
    if (!canViewProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar permissões",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar todas as permissões
    const permissions = await prisma.permission.findMany({
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
