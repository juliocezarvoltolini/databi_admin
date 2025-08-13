// src/app/admin/dashboards/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import DashboardsClient from "./dashboards-client";

export default async function DashboardsPage() {
  // Verificar autenticação
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect("/login");
  }

  const user = await getCurrentUser(payload.userId);
  if (!user) {
    redirect("/login");
  }

  // Verificar permissões
  const permissions = {
    canCreate: await hasPermission(user.id, "MANAGE_DASHBOARDS"),
    canEdit: await hasPermission(user.id, "MANAGE_DASHBOARDS"),
    canDelete: await hasPermission(user.id, "MANAGE_DASHBOARDS"),
  };

  return (
    <DashboardsClient
      user={user}
      permissions={permissions}
    />
  );
}