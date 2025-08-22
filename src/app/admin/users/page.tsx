// src/app/admin/users/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import UsersClient from "./users-client";


export default async function UsersPage() {
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

  // Verificar permissão para visualizar usuários
  const canViewUsers = await hasPermission(session.userId, "VIEW_USERS");
  if (!canViewUsers) {
    redirect("/admin");
  }

  // Verificar outras permissões
  const canCreateUsers = await hasPermission(session.userId, "CREATE_USERS");
  const canEditUsers = await hasPermission(session.userId, "EDIT_USERS");
  const canDeleteUsers = await hasPermission(session.userId, "DELETE_USERS");
  
  // Verificar se é administrador do sistema (pode visualizar empresas)
  const canViewCompanies = await hasPermission(session.userId, "VIEW_COMPANIES");

  return (
    <UsersClient
      user={user}
      permissions={{
        canCreate: canCreateUsers,
        canEdit: canEditUsers,
        canDelete: canDeleteUsers,
      }}
      isSystemAdmin={canViewCompanies}
    />
  );
}
