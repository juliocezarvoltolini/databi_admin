// src/app/api/profiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createProfileSchema,
  validateData,
  type ApiResponse,
} from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import {
  authenticateApiRequest,
  createAuthErrorResponse,
} from "@/lib/api-auth";

// GET - Listar perfis da empresa
export async function GET(request: NextRequest) {
  try {
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
        { success: false, error: "Perfil do usuário não encontrado" } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar perfis da empresa do perfil do usuário
    const whereClauses: any = {
      isActive: true,
    };

    if (userWithProfile.profile.companyId) {
      whereClauses.companyId = userWithProfile.profile.companyId;
    }

    const profiles = await prisma.profile.findMany({
      where: whereClauses,
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: { where: { isActive: true } },
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
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

    // Transformar dados para incluir contadores, permissões e empresa
    const profilesWithStats = profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      userCount: profile._count.users,
      permissions: profile.permissions.map((pp) => pp.permission),
      company: profile.company,
    }));

    return NextResponse.json({
      success: true,
      data: profilesWithStats,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao listar perfis:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Criar novo perfil
export async function POST(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para criar perfis
    const canCreateProfiles = await hasPermission(
      user.userId,
      "CREATE_PROFILES"
    );
    if (!canCreateProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para criar perfis",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();

    if (user.companyId && !body.companyId) {
      body.companyId = user.companyId;
    }

    if (user.companyId && body.companyId !== user.companyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Não é possível criar perfil para outra empresa",
        } as ApiResponse,
        { status: 403 }
      );
    }
    // Validar dados
    const validation = validateData(createProfileSchema, body);
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
        { success: false, error: "Perfil do usuário não encontrado" } as ApiResponse,
        { status: 403 }
      );
    }

    const {
      name,
      description,
      permissions,
      companyId
    } = validation.data!;

    // Verificar se já existe perfil com esse nome na mesma empresa
    const existingProfile = await prisma.profile.findFirst({
      where: {
        name,
        companyId,
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Já existe um perfil com este nome nesta empresa",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Verificar se a empresa existe
    const validCompany = await prisma.company.findFirst({
      where: {
        id: companyId,
        isActive: true,
      },
    });

    if (!validCompany) {
      return NextResponse.json(
        {
          success: false,
          error: "Empresa inválida",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validar se todas as permissões existem
    const validPermissions = await prisma.permission.findMany({
      where: {
        id: { in: permissions },
      },
    });

    if (validPermissions.length !== permissions.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Uma ou mais permissões são inválidas",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Criar perfil e suas permissões em uma transação
    const newProfile = await prisma.$transaction(async (tx) => {
      // Criar o perfil
      const profile = await tx.profile.create({
        data: {
          name,
          description: description || null,
          companyId,
        },
      });

      // Criar as permissões do perfil
      if (permissions && permissions.length > 0) {
        await tx.profilePermission.createMany({
          data: permissions.map((permissionId: string) => ({
            profileId: profile.id,
            permissionId
          })),
        });
      }

      // Retornar perfil com permissões e empresa
      return await tx.profile.findUnique({
        where: { id: profile.id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Perfil criado com sucesso",
      data: {
        id: newProfile!.id,
        name: newProfile!.name,
        description: newProfile!.description,
        isActive: newProfile!.isActive,
        createdAt: newProfile!.createdAt,
        userCount: 0,
        permissions: newProfile!.permissions.map((pp) => pp.permission),
        company: newProfile!.company,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao criar perfil:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
