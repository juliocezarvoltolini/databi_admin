// src/app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
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

  // Verificar permissões do usuário
  const canViewUsers = await hasPermission(session.userId, "VIEW_USERS");
  const canManageDashboards = await hasPermission(
    session.userId,
    "MANAGE_DASHBOARDS"
  );
  const isAdmin = await hasPermission(session.userId, "ADMIN_COMPANY");

  // Buscar dashboards da empresa
  const dashboards = await prisma.dashboard.findMany({
    where: {
      companyId: user.companyId,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company.name,
        profile: user.profile?.name || "Sem perfil",
      }}
      dashboards={dashboards.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        powerbiUrl: d.powerbiUrl,
      }))}
      permissions={{
        canViewUsers,
        canManageDashboards,
        isAdmin,
      }}
    />
  );
}
