// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

import { createUserSchema, validateData, type ApiResponse } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";

// GET - Listar usuários da empresa
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const companyId = headersList.get("x-company-id");

    // if (!userId || !companyId) {
    //   return NextResponse.json(
    //     { success: false, error: "Não autorizado" } as ApiResponse,
    //     { status: 401 }
    //   );
    // }

    // Verificar permissão
    const canViewUsers = await hasPermission(userId, "VIEW_USERS");
    if (!canViewUsers) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar usuários",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar usuários da empresa
    const users = await prisma.user.findMany({
      where: {
       /* companyId: companyId,*/
        isActive: true,
      },
      select: {
        // id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
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
    const canCreateUsers = await hasPermission(userId, "CREATE_USERS");
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

    const { email, name, password, profileId } = validation.data!;

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

    // Verificar se o perfil existe e pertence à empresa
    if (profileId) {
      const profile = await prisma.profile.findFirst({
        where: {
          id: profileId,
          companyId: companyId,
        },
      });

      if (!profile) {
        return NextResponse.json(
          { success: false, error: "Perfil inválido" } as ApiResponse,
          { status: 400 }
        );
      }

      // Verificar se o usuário atual pode atribuir este perfil
      // (só pode atribuir perfis com permissões que ele mesmo possui)
      const currentUserProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            include: {
              permissions: {
                include: {
                  permission: true,
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
        },
      });

      if (targetProfile) {
        const currentUserPermissions =
          currentUserProfile.profile.permissions.map(
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
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        companyId,
        profileId: profileId || null,
      },
      select: {
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
      },
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
