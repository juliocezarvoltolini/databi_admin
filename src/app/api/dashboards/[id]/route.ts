// src/app/api/dashboards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createDashboardSchema,
  validateData,
  type ApiResponse,
} from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import {
  authenticateApiRequest,
  createAuthErrorResponse,
} from "@/lib/api-auth";

// GET - Buscar dashboard específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para visualizar dashboards
    const canViewDashboards = await hasPermission(
      user.userId,
      "MANAGE_DASHBOARDS"
    );
    if (!canViewDashboards) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar dashboards",
        } as ApiResponse,
        { status: 403 }
      );
    }

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

    const whereClause: any = {
       id: resolvedParams.id,
       isActive: true,
    }

    if (userWithProfile.profile.companyId) {
      whereClause.companyId = userWithProfile.profile.companyId;
    }

    console.log("Where clause for dashboard:", whereClause); // Debugging line

    // Buscar dashboard
    const dashboard = await prisma.dashboard.findFirst({
      where: whereClause,
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

    if (!dashboard) {
      return NextResponse.json(
        { success: false, error: "Dashboard não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dashboard,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT - Atualizar dashboard
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para editar dashboards
    const canEditDashboards = await hasPermission(
      user.userId,
      "MANAGE_DASHBOARDS"
    );
    if (!canEditDashboards) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para editar dashboards",
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

    const whereClause: any = {
      id: resolvedParams.id,
    };

    if (userWithProfile.profile.companyId) {
      whereClause.companyId = userWithProfile.profile.companyId;
    }

    // Verificar se dashboard existe e pertence à empresa
    const existingDashboard = await prisma.dashboard.findFirst({
      where: whereClause,
    });

    if (!existingDashboard) {
      return NextResponse.json(
        { success: false, error: "Dashboard não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    const { name, description, powerbiUrl, companyId } = validation.data!;
    
    // Determinar a empresa do dashboard  
    const targetCompanyId = companyId || userWithProfile.profile.companyId;

    // Verificar se já existe outro dashboard com esse nome na empresa
    const duplicateDashboard = await prisma.dashboard.findFirst({
      where: {
        name,
        companyId: targetCompanyId,
        id: { not: resolvedParams.id },
      },
    });

    if (duplicateDashboard) {
      return NextResponse.json(
        {
          success: false,
          error: "Já existe outro dashboard com este nome na empresa",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Atualizar dashboard
    const updatedDashboard = await prisma.dashboard.update({
      where: { id: resolvedParams.id },
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
      message: "Dashboard atualizado com sucesso",
      data: updatedDashboard,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao atualizar dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE - Desativar dashboard (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para excluir dashboards
    const canDeleteDashboards = await hasPermission(
      user.userId,
      "MANAGE_DASHBOARDS"
    );
    if (!canDeleteDashboards) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para excluir dashboards",
        } as ApiResponse,
        { status: 403 }
      );
    }

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

    // Verificar se dashboard existe e pertence à empresa
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id: resolvedParams.id,
        companyId: userWithProfile.profile.companyId,
      },
    });

    if (!existingDashboard) {
      return NextResponse.json(
        { success: false, error: "Dashboard não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    // Desativar dashboard (soft delete)
    await prisma.dashboard.update({
      where: { id: resolvedParams.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Dashboard desativado com sucesso",
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao desativar dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
