// src/lib/permissions.ts
import { prisma } from "@/lib/prisma";

/**
 * Verifica se um usuário tem uma permissão específica
 * @param userId - ID do usuário
 * @param permissionName - Nome da permissão (ex: "VIEW_USERS", "CREATE_USERS")
 * @returns boolean - true se o usuário tem a permissão, false caso contrário
 */
export async function hasPermission(
  userId: string | null,
  permissionName: string
): Promise<boolean> {
  try {
    // Validar se userId não é null/undefined
    if (!userId) {
      console.error("hasPermission: userId é null ou undefined");
      return false;
    }

    // Buscar o usuário com seu perfil e permissões
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
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

    // Se usuário não existe ou não tem perfil
    if (!user || !user.profile) {
      console.error(
        `hasPermission: Usuário ${userId} não encontrado ou sem perfil`
      );
      return false;
    }

    // Verificar se tem a permissão específica
    const hasGeneralPermission = user.profile.permissions.some((pp) => {
      return pp.permission.name === permissionName;
    });

    return hasGeneralPermission;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
}

/**
 * Verifica se um usuário pode acessar um dashboard específico
 * @param userId - ID do usuário
 * @param dashboardId - ID do dashboard
 * @returns boolean - true se o usuário pode acessar o dashboard
 */
export async function canAccessDashboard(
  userId: string | null,
  dashboardId: string
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  // Verificar se tem permissão VIEW_DASHBOARD
  return await hasPermission(userId, "VIEW_DASHBOARD");
}

/**
 * Busca todas as permissões de um usuário
 * @param userId - ID do usuário
 * @returns Array com todas as permissões do usuário
 */
export async function getUserPermissions(userId: string | null) {
  if (!userId) {
    return [];
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
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

    if (!user || !user.profile) {
      return [];
    }

    return user.profile.permissions.map((pp) => ({
      permission: pp.permission,
    }));
  } catch (error) {
    console.error("Erro ao buscar permissões do usuário:", error);
    return [];
  }
}
