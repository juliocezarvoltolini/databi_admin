// src/app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import DashboardLayoutClient from "./dashboard-layout-client";

export default async function DashboardLayout({
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

  // Verificar permissões básicas
  const canViewUsers = await hasPermission(session.userId, "VIEW_USERS");
  const canViewProfiles = await hasPermission(session.userId, "VIEW_PROFILES");
  const canManageDashboards = await hasPermission(
    session.userId,
    "MANAGE_DASHBOARDS"
  );
  const canViewCompanies = await hasPermission(session.userId, "VIEW_COMPANIES");
  const isAdmin = await hasPermission(session.userId, "ADMIN_COMPANY");

  // Buscar dashboards da empresa para o menu lateral
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
    <DashboardLayoutClient
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
    </DashboardLayoutClient>
  );
}