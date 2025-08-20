// src/app/api/dashboards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDashboardSchema, validateData, type ApiResponse } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import { authenticateApiRequest, createAuthErrorResponse } from "@/lib/api-auth";

// GET - Listar dashboards da empresa
export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para visualizar dashboards
    const canViewDashboards = await hasPermission(user.userId, "MANAGE_DASHBOARDS");
    if (!canViewDashboards) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar dashboards",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar usuário com perfil para determinar empresa
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { profile: true },
    });

    if (!userWithProfile?.profile) {
      return NextResponse.json(
        { success: false, error: "Perfil do usuário não encontrado" } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar dashboards da empresa do perfil (ou todos se for administrador do sistema)
    const whereClause = userWithProfile.profile.companyId 
      ? { companyId: userWithProfile.profile.companyId, isActive: true }
      : { isActive: true };


          console.log("Where clause for dashboard:", whereClause); // Debugging line
    
    const dashboards = await prisma.dashboard.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        powerbiUrl: true,
        isActive: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: dashboards,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao listar dashboards:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Criar novo dashboard
export async function POST(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para criar dashboards
    const canCreateDashboards = await hasPermission(user.userId, "MANAGE_DASHBOARDS");
    if (!canCreateDashboards) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para gerenciar dashboards",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validation = validateData(createDashboardSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: validation.errors,
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { name, description, powerbiUrl, companyId } = validation.data!;
    
    // Buscar perfil do usuário para determinar empresa
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { profile: true },
    });

    if (!userWithProfile?.profile) {
      return NextResponse.json(
        { success: false, error: "Perfil do usuário não encontrado" } as ApiResponse,
        { status: 403 }
      );
    }

    // Determinar a empresa do dashboard
    // Se companyId for fornecido explicitamente, usar ele
    // Se não for fornecido, usar a empresa do perfil do usuário
    const targetCompanyId = companyId || userWithProfile.profile.companyId;

    // Verificar se já existe dashboard com esse nome na empresa
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        name,
        companyId: targetCompanyId,
      },
    });

    if (existingDashboard) {
      return NextResponse.json(
        { success: false, error: "Já existe um dashboard com este nome na empresa" } as ApiResponse,
        { status: 400 }
      );
    }

    // Criar dashboard
    const newDashboard = await prisma.dashboard.create({
      data: {
        name,
        description: description || null,
        powerbiUrl,
        companyId: targetCompanyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dashboard criado com sucesso",
      data: newDashboard,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao criar dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}