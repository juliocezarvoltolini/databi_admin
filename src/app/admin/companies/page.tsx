
// src/app/admin/companies/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import CompaniesClient from "./companies-client";

export default async function CompaniesPage() {
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

  // Verificar permissão para visualizar empresas
  const canViewCompanies = await hasPermission(session.userId, "VIEW_COMPANIES");
  if (!canViewCompanies) {
    redirect("/admin");
  }

  // Verificar outras permissões
  const canCreateCompanies = await hasPermission(session.userId, "CREATE_COMPANIES");
  const canEditCompanies = await hasPermission(session.userId, "EDIT_COMPANIES");
  const canDeleteCompanies = await hasPermission(session.userId, "DELETE_COMPANIES");

  return (
    <CompaniesClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
      }}
      permissions={{
        canCreate: canCreateCompanies,
        canEdit: canEditCompanies,
        canDelete: canDeleteCompanies,
      }}
    />
  );
}