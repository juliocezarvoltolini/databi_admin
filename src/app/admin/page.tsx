// src/app/admin/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export default async function AdminPage() {
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

  // Verificar permissões para determinar onde redirecionar
  const canViewUsers = await hasPermission(session.userId, "VIEW_USERS");
  const canViewProfiles = await hasPermission(session.userId, "VIEW_PROFILES");
  const canManageDashboards = await hasPermission(session.userId, "MANAGE_DASHBOARDS");
  const canViewCompanies = await hasPermission(session.userId, "VIEW_COMPANIES");

  // Redirecionar para a primeira página disponível
  if (canViewUsers) {
    redirect("/admin/users");
  } else if (canViewProfiles) {
    redirect("/admin/profiles");
  } else if (canManageDashboards) {
    redirect("/admin/dashboards");
  } else if (canViewCompanies) {
    redirect("/admin/companies");
  } else {
    // Se não tem nenhuma permissão administrativa, redirecionar para login
    redirect("/login");
  }
}