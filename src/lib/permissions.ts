// lib/permissions.ts
let prisma: any = null;

// Import dinâmico do Prisma para evitar problemas de inicialização
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaInstance } = await import("./prisma");
      prisma = prismaInstance;
    } catch (error) {
      console.error("❌ Erro ao importar Prisma em permissions:", error);
      throw new Error("Prisma client not available in permissions module");
    }
  }
  return prisma;
}

// Tipos de permissões disponíveis
export const PERMISSIONS = {
  // Dashboards
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  MANAGE_DASHBOARDS: "MANAGE_DASHBOARDS",

  // Usuários
  VIEW_USERS: "VIEW_USERS",
  CREATE_USERS: "CREATE_USERS",
  EDIT_USERS: "EDIT_USERS",
  DELETE_USERS: "DELETE_USERS",

  // Perfis
  VIEW_PROFILES: "VIEW_PROFILES",
  CREATE_PROFILES: "CREATE_PROFILES",
  EDIT_PROFILES: "EDIT_PROFILES",
  DELETE_PROFILES: "DELETE_PROFILES",

  // Sistema
  ADMIN_COMPANY: "ADMIN_COMPANY",
} as const;

export type PermissionType = keyof typeof PERMISSIONS;

// Função para verificar se usuário tem permissão específica
export async function hasPermission(
  userId: string,
  permission: PermissionType,
  dashboardId?: string
): Promise<boolean> {
  try {
    const prismaClient = await getPrisma();

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            permissions: {
              include: {
                permission: true,
                dashboard: true,
              },
            },
          },
        },
      },
    });

    if (!user?.profile) return false;

    // Verificar se tem a permissão
    const hasGeneralPermission = user.profile.permissions.some(
      (pp: any) => pp.permission.name === permission && !pp.dashboardId
    );

    // Se não tem permissão geral, verificar permissão específica do dashboard
    if (!hasGeneralPermission && dashboardId) {
      return user.profile.permissions.some(
        (pp: any) =>
          pp.permission.name === permission && pp.dashboardId === dashboardId
      );
    }

    return hasGeneralPermission;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
}

// Função para obter todas as permissões do usuário
export async function getUserPermissions(userId: string) {
  try {
    const prismaClient = await getPrisma();

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            permissions: {
              include: {
                permission: true,
                dashboard: true,
              },
            },
          },
        },
      },
    });

    if (!user?.profile) return [];

    return user.profile.permissions.map((pp: any) => ({
      permission: pp.permission.name,
      dashboardId: pp.dashboardId,
      dashboardName: pp.dashboard?.name,
    }));
  } catch (error) {
    console.error("Erro ao buscar permissões do usuário:", error);
    return [];
  }
}

// Função para verificar se um usuário pode conceder uma permissão a outro
export async function canGrantPermission(
  grantorId: string,
  permission: PermissionType,
  dashboardId?: string
): Promise<boolean> {
  // Regra: só pode conceder permissões que ele mesmo possui
  return await hasPermission(grantorId, permission, dashboardId);
}

// Função para obter perfis disponíveis na empresa
export async function getCompanyProfiles(companyId: string) {
  try {
    const prismaClient = await getPrisma();

    return await prismaClient.profile.findMany({
      where: {
        companyId,
        isActive: true,
      },
      include: {
        permissions: {
          include: {
            permission: true,
            dashboard: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar perfis da empresa:", error);
    return [];
  }
}

// Função para criar perfil padrão para nova empresa
export async function createDefaultProfiles(companyId: string) {
  try {
    const prismaClient = await getPrisma();

    // Primeiro, garantir que as permissões existem
    await ensurePermissionsExist();

    // Perfil Admin - tem todas as permissões
    const adminProfile = await prismaClient.profile.create({
      data: {
        name: "Administrador",
        description: "Acesso total ao sistema da empresa",
        companyId,
      },
    });

    // Perfil Visualizador - só visualizar dashboards
    const viewerProfile = await prismaClient.profile.create({
      data: {
        name: "Visualizador",
        description: "Apenas visualização de dashboards",
        companyId,
      },
    });

    // Atribuir permissões ao Admin
    const allPermissions = await prismaClient.permission.findMany();
    await prismaClient.profilePermission.createMany({
      data: allPermissions.map((permission: any) => ({
        profileId: adminProfile.id,
        permissionId: permission.id,
      })),
    });

    // Atribuir apenas VIEW_DASHBOARD ao Visualizador
    const viewPermission = await prismaClient.permission.findUnique({
      where: { name: PERMISSIONS.VIEW_DASHBOARD },
    });

    if (viewPermission) {
      await prismaClient.profilePermission.create({
        data: {
          profileId: viewerProfile.id,
          permissionId: viewPermission.id,
        },
      });
    }

    return { adminProfile, viewerProfile };
  } catch (error) {
    console.error("Erro ao criar perfis padrão:", error);
    throw error;
  }
}

// Garantir que todas as permissões existem no banco
async function ensurePermissionsExist() {
  try {
    const prismaClient = await getPrisma();

    const permissions = [
      {
        name: PERMISSIONS.VIEW_DASHBOARD,
        description: "Visualizar dashboards",
        category: "DASHBOARD",
      },
      {
        name: PERMISSIONS.MANAGE_DASHBOARDS,
        description: "Gerenciar dashboards",
        category: "DASHBOARD",
      },
      {
        name: PERMISSIONS.VIEW_USERS,
        description: "Visualizar usuários",
        category: "USER",
      },
      {
        name: PERMISSIONS.CREATE_USERS,
        description: "Criar usuários",
        category: "USER",
      },
      {
        name: PERMISSIONS.EDIT_USERS,
        description: "Editar usuários",
        category: "USER",
      },
      {
        name: PERMISSIONS.DELETE_USERS,
        description: "Excluir usuários",
        category: "USER",
      },
      {
        name: PERMISSIONS.VIEW_PROFILES,
        description: "Visualizar perfis",
        category: "PROFILE",
      },
      {
        name: PERMISSIONS.CREATE_PROFILES,
        description: "Criar perfis",
        category: "PROFILE",
      },
      {
        name: PERMISSIONS.EDIT_PROFILES,
        description: "Editar perfis",
        category: "PROFILE",
      },
      {
        name: PERMISSIONS.DELETE_PROFILES,
        description: "Excluir perfis",
        category: "PROFILE",
      },
      {
        name: PERMISSIONS.ADMIN_COMPANY,
        description: "Administração da empresa",
        category: "SYSTEM",
      },
    ];

    for (const perm of permissions) {
      await prismaClient.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm,
      });
    }
  } catch (error) {
    console.error("Erro ao garantir permissões:", error);
    throw error;
  }
}
