// src/app/admin/profiles/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ProfilesClient from "./profiles-client";


export default async function ProfilesPage() {
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

  // Verificar permissão para visualizar perfis
  const canViewProfiles = await hasPermission(session.userId, "VIEW_PROFILES");
  if (!canViewProfiles) {
    redirect("/dashboard");
  }

  // Verificar outras permissões
  const canCreateProfiles = await hasPermission(
    session.userId,
    "CREATE_PROFILES"
  );
  const canEditProfiles = await hasPermission(session.userId, "EDIT_PROFILES");
  const canDeleteProfiles = await hasPermission(
    session.userId,
    "DELETE_PROFILES"
  );

  return (
    <ProfilesClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company.name,
      }}
      permissions={{
        canCreate: canCreateProfiles,
        canEdit: canEditProfiles,
        canDelete: canDeleteProfiles,
      }}
    />
  );
}
