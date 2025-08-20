// src/app/api/profiles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  updateProfileSchema,
  validateData,
  type ApiResponse,
} from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import {
  authenticateApiRequest,
  createAuthErrorResponse,
} from "@/lib/api-auth";
import { id } from "zod/locales";

// GET - Buscar perfil específico
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

    // Verificar permissão para visualizar perfis
    const canViewProfiles = await hasPermission(user.userId, "VIEW_PROFILES");
    if (!canViewProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar perfis",
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
        {
          success: false,
          error: "Perfil do usuário não encontrado",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const whereClause: any = {
      isActive: true,
      id: resolvedParams.id,
    };

    if (userWithProfile.profile.companyId) {
      whereClause.companyId = userWithProfile.profile.companyId;
    }

    // Buscar perfil (apenas da mesma empresa)
    const profile = await prisma.profile.findFirst({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },        
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: { where: { isActive: true } },
          },
        },
        dashboards: {
          include: {
            dashboard: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        userCount: profile._count.users,
        company: profile.company,
        permissions: profile.permissions.map((pp) => pp.permission),
        dashboards: profile.dashboards.map((d) => ({
          id: d.dashboard.id,
          name: d.dashboard.name,
          powerbiUrl: d.dashboard.powerbiUrl,
          isActive: d.dashboard.isActive,
          createdAt: d.dashboard.createdAt,
        })),
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT - Atualizar perfil
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

    // Verificar permissão para editar perfis
    const canEditProfiles = await hasPermission(user.userId, "EDIT_PROFILES");
    if (!canEditProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para editar perfis",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validation = validateData(updateProfileSchema, body);
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

    // Buscar usuário com perfil para determinar empresa
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { profile: true },
    });

    if (!userWithProfile?.profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Perfil do usuário não encontrado",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const whereClause: any = {
      id: resolvedParams.id,
    };

    if (userWithProfile.profile.companyId) {
      whereClause.companyId = userWithProfile.profile.companyId;
    }

    // Verificar se o perfil existe e pertence à mesma empresa
    const existingProfile = await prisma.profile.findFirst({
      where: whereClause,
    });

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    const { name, description, companyId, isActive, dashboards } = validation.data!;

    // Se companyId foi fornecido, verificar se é a mesma empresa do usuário
    if (
      companyId &&
      userWithProfile.profile.companyId &&
      companyId !== userWithProfile.profile.companyId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Não é possível mover perfil para outra empresa",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Verificar se já existe outro perfil com esse nome na empresa
    if (name) {
      const whereClause: any = {
        name: name,
        id: { not: resolvedParams.id },
      };

      if (userWithProfile.profile.companyId) {
        whereClause.companyId = userWithProfile.profile.companyId;
      }
      const duplicateProfile = await prisma.profile.findFirst({
        where: whereClause,
      });

      if (duplicateProfile) {
        return NextResponse.json(
          {
            success: false,
            error: "Já existe outro perfil com este nome nesta empresa",
          } as ApiResponse,
          { status: 400 }
        );
      }
    }

    // Atualizar perfil
    const updatedProfile = await prisma.profile.update({
      where: { id: resolvedParams.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        companyId: companyId,
        ...(dashboards && {
          dashboards: {
            deleteMany: {}, // Remove associações existentes
            create: dashboards.map((dashboardId: string) => ({
              dashboardId })  ), // Adiciona novas associações
          },
        }),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
        dashboards: {
          include: {
            dashboard: true,
          }
        },
        _count: {
          select: {
            users: { where: { isActive: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      data: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        description: updatedProfile.description,
        isActive: updatedProfile.isActive,
        createdAt: updatedProfile.createdAt,
        userCount: updatedProfile._count.users,
        company: updatedProfile.company,
        permissions: updatedProfile.permissions.map((pp) => pp.permission),
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE - Desativar perfil (soft delete)
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

    // Verificar permissão para excluir perfis
    const canDeleteProfiles = await hasPermission(
      user.userId,
      "DELETE_PROFILES"
    );
    if (!canDeleteProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para excluir perfis",
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
        {
          success: false,
          error: "Perfil do usuário não encontrado",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const whereClause: any = {
      id: resolvedParams.id,
    };

    if (userWithProfile.profile.companyId) {
      whereClause.companyId = userWithProfile.profile.companyId;
    }

    // Verificar se o perfil existe e pertence à mesma empresa
    const existingProfile = await prisma.profile.findFirst({
      where: whereClause,
    });

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    // Verificar se há usuários usando este perfil
    const usersWithProfile = await prisma.user.count({
      where: {
        profileId: resolvedParams.id,
        isActive: true,
      },
    });

    if (usersWithProfile > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Não é possível excluir perfil que está em uso por usuários",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Desativar perfil
    await prisma.profile.update({
      where: { id: resolvedParams.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Perfil desativado com sucesso",
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao desativar perfil:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
