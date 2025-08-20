// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { updateUserSchema, validateData, type ApiResponse } from "@/lib/types";
import { authenticateApiRequest, createAuthErrorResponse } from "@/lib/api-auth";



// GET - Buscar usuário específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;
    const resolvedParams = await params;

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

    // Buscar usuário
    const targetUser = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
 
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        profileId: true,
        profile: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: targetUser,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;
    const resolvedParams = await params;

    // Verificar permissão
    const canEditUsers = await hasPermission(user.userId, "EDIT_USERS");
    if (!canEditUsers) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para editar usuários",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validation = validateData(updateUserSchema, body);
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

    const updateData = validation.data!;

    // Verificar se usuário existe e pertence à empresa
    const existingUser = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
 
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    // Verificar se email já está em uso (se está sendo alterado)
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailInUse) {
        return NextResponse.json(
          { success: false, error: "Email já está em uso" } as ApiResponse,
          { status: 400 }
        );
      }
    }

    // Verificar perfil se está sendo alterado
    if (updateData.profileId !== undefined) {
      if (updateData.profileId) {
        const profile = await prisma.profile.findFirst({
          where: {
            id: updateData.profileId,
            isActive: true,
          },
        });

        if (!profile) {
          return NextResponse.json(
            { success: false, error: "Perfil inválido ou não disponível para esta empresa" } as ApiResponse,
            { status: 400 }
          );
        }

        // Mesma validação de permissões do POST
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
                company: true,
              },
            },
          },
        });

        if (currentUserProfile?.profile) {
          const targetProfile = await prisma.profile.findUnique({
            where: { id: updateData.profileId },
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
              company: true,
             
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
      }
    }

    // Preparar dados para atualização
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = {};

    if (updateData.name) dataToUpdate.name = updateData.name;
    if (updateData.email) dataToUpdate.email = updateData.email;
    if (updateData.profileId !== undefined)
      dataToUpdate.profileId = updateData.profileId;
    if (updateData.isActive !== undefined)
      dataToUpdate.isActive = updateData.isActive;

    // Hash da senha se fornecida
    if (updateData.password) {
      dataToUpdate.password = await hashPassword(updateData.password);
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: dataToUpdate,
      select: {
        id: true,
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
    });

    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: updatedUser,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE - Desativar usuário (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;
    const resolvedParams = await params;

    // Verificar permissão
    const canDeleteUsers = await hasPermission(user.userId, "DELETE_USERS");
    if (!canDeleteUsers) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para excluir usuários",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Não permitir que o usuário exclua a si mesmo
    if (resolvedParams.id === user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Você não pode excluir sua própria conta",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Verificar se usuário existe e pertence à empresa
    const existingUser = await prisma.user.findFirst({
      where: {
        id: resolvedParams.id,
        companyId: user.companyId,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    // Desativar usuário (soft delete)
    await prisma.user.update({
      where: { id: resolvedParams.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Usuário desativado com sucesso",
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}
