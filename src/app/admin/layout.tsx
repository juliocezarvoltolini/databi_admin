// src/app/admin/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import AdminLayoutClient from "./admin-layout-client";
import { Company, Dashboard, Permission, Profile, User } from "@/generated/prisma";
import { DeepPartial } from "react-hook-form";
export interface DashboardClient extends DeepPartial<Dashboard> {}
export interface PermissionClient extends DeepPartial<Permission> {}
export interface CompanyClient extends DeepPartial<Company> {
   dashboards?: DashboardClient[];
}

export interface ProfileClient extends DeepPartial<Profile>{
  company: CompanyClient;
  dashboards: DashboardClient[];
  permissions: PermissionClient[];
} 

export interface UserClient extends User {
company: CompanyClient;
profile: ProfileClient
}

export interface PermissionsEnum {
  [key: string]: boolean // permite qualquer propriedade
}

export interface PermissionVerbs {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticação
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifyToken(token);
  if (!session) {
    redirect("/login");
  }

  // Buscar dados do usuário
  const user = await getCurrentUser(session.userId);

  if (!user) {
    redirect("/login");
  }

  // Verificar permissões básicas para área administrativa
  const canViewUsers = await hasPermission(session.userId, "VIEW_USERS");
  const canViewProfiles = await hasPermission(session.userId, "VIEW_PROFILES");
  const canManageDashboards = await hasPermission(
    session.userId,
    "MANAGE_DASHBOARDS"
  );
  const canViewCompanies = await hasPermission(
    session.userId,
    "VIEW_COMPANIES"
  );
  const isAdmin = await hasPermission(session.userId, "ADMIN_COMPANY");

  // Se não tem nenhuma permissão administrativa, redirecionar para login
  if (
    !canViewUsers &&
    !canViewProfiles &&
    !canManageDashboards &&
    !canViewCompanies &&
    !isAdmin
  ) {
    redirect("/login");
  }

  // Buscar dashboards da empresa do usuário

  const whereClaude: any = {
    isActive: true,
  };

  if (user.companyId) {
    whereClaude.companyId = user.companyId;
  }

  const companyDashboards = await prisma.dashboard.findMany({
    where: whereClaude,
    orderBy: {
      name: "asc",
    },
  });

  return (
    <AdminLayoutClient
      user={user}
      permissions={{
        canViewUsers,
        canViewProfiles,
        canManageDashboards,
        canViewCompanies,
        isAdmin,
      }}
      companyDashboards={companyDashboards}
    >
      {children}
    </AdminLayoutClient>
  );
}
