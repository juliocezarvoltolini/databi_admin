// src/app/admin/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import AdminLayoutClient from "./admin-layout-client";

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
  const canViewCompanies = await hasPermission(session.userId, "VIEW_COMPANIES");
  const isAdmin = await hasPermission(session.userId, "ADMIN_COMPANY");

  // Se não tem nenhuma permissão administrativa, redirecionar para login
  if (!canViewUsers && !canViewProfiles && !canManageDashboards && !canViewCompanies && !isAdmin) {
    redirect("/login");
  }

  // Buscar dashboards da empresa do usuário
  const companyDashboards = user.company ? await prisma.dashboard.findMany({
    where: {
      companyId: user.company.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      powerbiUrl: true,
    },
    orderBy: {
      name: "asc",
    },
  }) : [];

  return (
    <AdminLayoutClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        profile: user.profile,
      }}
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
