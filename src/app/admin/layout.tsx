// src/app/admin/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
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
  const isAdmin = await hasPermission(session.userId, "ADMIN_COMPANY");

  // Se não tem nenhuma permissão administrativa, redirecionar
  if (!canViewUsers && !canViewProfiles && !canManageDashboards && !isAdmin) {
    redirect("/dashboard");
  }

  return (
    <AdminLayoutClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company.name,
        profile: user.profile?.name || "Sem perfil",
      }}
      permissions={{
        canViewUsers,
        canViewProfiles,
        canManageDashboards,
        isAdmin,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
