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
  const canManageDashboards = await hasPermission(
    session.userId,
    "MANAGE_DASHBOARDS"
  );
  const canViewCompanies = await hasPermission(
    session.userId,
    "VIEW_COMPANIES"
  );

  console.log("Vai redirecionar")

  // Redirecionar para a primeira página disponível
  if (canViewUsers) {
    redirect("/admin/users");
  } else if (canViewProfiles) {
    redirect("/admin/profiles");
  } else if (canManageDashboards) {
    redirect("/admin/dashboards");
  } else if (canViewCompanies) {
    redirect("/admin/companies");
  } else if (user.company.dashboards && user.company.dashboards.length > 0) {
    console.log("Vai para o dash")
    redirect(`/admin/dashboard/${user.company.dashboards[0].id}`)
  } else {
    console.log(
      "Usuário não tem permissões administrativas, redirecionando para login"
    );
    // Se não tem nenhuma permissão administrativa, redirecionar para login
    redirect("/login");
  }
}
