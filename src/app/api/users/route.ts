// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createUserSchema, validateData, type ApiResponse } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import {
  authenticateApiRequest,
  createAuthErrorResponse,
} from "@/lib/api-auth";

// GET - Listar usuários da empresa
export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão
    const canViewUsers = await hasPermission(user.userId, "VIEW_USERS");
    if (!canViewUsers) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar usuários",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar usuários da empresa (ou todos se for administrador do sistema)

    const whereClause = user.companyId
      ? { companyId: user.companyId, isActive: true }
      : { isActive: true };

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        profile: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão
    const canCreateUsers = await hasPermission(user.userId, "CREATE_USERS");
    if (!canCreateUsers) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para criar usuários",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validation = validateData(createUserSchema, body);
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

    const { email, name, password, profileId, companyId } = validation.data!;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email já está em uso" } as ApiResponse,
        { status: 400 }
      );
    }

    //Se não tem companyId então o usuário é um administrador do sistema.
    if (!user.companyId && companyId) {
      const exixteRelacao = await prisma.profileCompany.findFirst({
        where: {
          companyId: companyId,
          profileId: profileId,
        },
      });

      if (!exixteRelacao) {
        const relacaoCriada = await prisma.profileCompany.create({
          data: { companyId: companyId, profileId: profileId },
        });
      }
    }

    // Determinar a empresa do novo usuário
    // Se companyId for fornecido explicitamente (incluindo null), usar ele
    // Se não for fornecido, usar a empresa do usuário atual
    const targetCompanyId =
      companyId !== undefined ? companyId : user.companyId;

    // Verificar se o perfil existe e está associado à empresa correta (se houver empresa)
    const profileWhere: any = {
      id: profileId,
      isActive: true,
    };

    // Se o usuário está sendo criado para uma empresa específica, verificar se o perfil está associado a ela
    if (targetCompanyId) {
      profileWhere.companies = {
        some: {
          companyId: targetCompanyId,
        },
      };
    }

    const profile = await prisma.profile.findFirst({
      where: profileWhere,
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: targetCompanyId
            ? "Perfil inválido ou não disponível para esta empresa"
            : "Perfil inválido",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Verificar se o usuário atual pode atribuir este perfil
    // (só pode atribuir perfis com permissões que ele mesmo possui)
    const currentUserProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        profile: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
            companies: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    if (!currentUserProfile?.profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuário atual sem perfil definido",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Buscar permissões do perfil que será atribuído
    const targetProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        companies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (targetProfile) {
      const currentUserPermissions = currentUserProfile.profile.permissions.map(
        (pp) => pp.permission.name
      );
      const targetPermissions = targetProfile.permissions.map(
        (pp) => pp.permission.name
      );

      // Verificar se o usuário atual tem todas as permissões que vai atribuir
      const hasAllPermissions = targetPermissions.every((permission) =>
        currentUserPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Você não pode atribuir um perfil com permissões que você não possui",
          } as ApiResponse,
          { status: 403 }
        );
      }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const userData: any = {
      email,
      name,
      password: hashedPassword,
      profileId: profileId,
    };

    // Só adicionar companyId se não for null
    if (targetCompanyId !== null) {
      userData.companyId = targetCompanyId;
    }

    const userSelect: any = {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    };

    // Só incluir company se o usuário tiver uma empresa
    if (targetCompanyId !== null) {
      userSelect.company = {
        select: {
          id: true,
          name: true,
        },
      };
    }

    const newUser = await prisma.user.create({
      data: userData,
      select: userSelect,
    });

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      data: newUser,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
