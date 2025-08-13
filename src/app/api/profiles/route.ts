// src/app/api/profiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { type ApiResponse } from "@/lib/types";

// GET - Listar perfis da empresa
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const companyId = headersList.get("x-company-id");

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" } as ApiResponse,
        { status: 401 }
      );
    }

    // Verificar permissão
    const canViewProfiles = await hasPermission(userId, "VIEW_PROFILES");
    if (!canViewProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar perfis",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar perfis da empresa
    const profiles = await prisma.profile.findMany({
      where: {
        companyId: companyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: {
              where: {
                isActive: true,
              },
            },
          },
        },
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Formatar resposta
    const formattedProfiles = profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      userCount: profile._count.users,
      permissions: profile.permissions.map((pp) => pp.permission),
    }));

    return NextResponse.json({
      success: true,
      data: formattedProfiles,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao listar perfis:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
