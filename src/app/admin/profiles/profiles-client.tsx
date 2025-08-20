// src/app/admin/profiles/profiles-client.tsx
"use client";

import { useState, useEffect } from "react";
import ProfileForm from "./profile.form";
import ProfileList from "./profile-list";
import { Company } from "@/generated/prisma";
import { 
  AdminLayout, 
  PageHeader, 
  StatsCard, 
  AdminCard, 
  AdminButton, 
  LoadingSpinner,
  ProfilesIcon,
  CheckCircleIcon,
  UsersIcon,
  PlusIcon
} from "@/components/admin";

interface User {
  id: string;
  name: string;
  email: string;
  company: Company;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Profile {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  userCount: number;
  permissions: Permission[];
  companies: Company[];
}

interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Props {
  user: User;
  permissions: Permissions;
}

export default function ProfilesClient({ user, permissions }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar perfis
      const profilesResponse = await fetch("/api/profiles");
      if (profilesResponse.ok) {
        const profilesResult = await profilesResponse.json();
        if (profilesResult.success) {
          setProfiles(profilesResult.data);
        }
      }

      // Carregar todas as permissões disponíveis
      const permissionsResponse = await fetch("/api/permissions");
      if (permissionsResponse.ok) {
        const permissionsResult = await permissionsResponse.json();
        if (permissionsResult.success) {
          setAllPermissions(permissionsResult.data);
        }
      }

      // Carregar todas as empresas disponíveis
      const companiesResponse = await fetch("/api/companies");
      if (companiesResponse.ok) {
        const companiesResult = await companiesResponse.json();
        if (companiesResult.success) {
          setAllCompanies(companiesResult.data);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setShowForm(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleDeleteProfile = async (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);

    if (profile && profile.userCount > 0) {
      alert(
        `Não é possível excluir este perfil pois existem ${profile.userCount} usuário(s) vinculado(s) a ele.`
      );
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este perfil?")) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await loadData(); // Recarregar lista
        alert("Perfil excluído com sucesso!");
      } else {
        alert(result.error || "Erro ao excluir perfil");
      }
    } catch (error) {
      console.error("Erro ao excluir perfil:", error);
      alert("Erro ao excluir perfil");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProfile(null);
    loadData(); // Recarregar lista
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProfile(null);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando perfis..." />;
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Gestão de Perfis"
        subtitle="Gerencie os perfis de acesso e suas permissões na empresa"
        icon={<ProfilesIcon />}
      />

      {error && (
        <AdminCard variant="elevated" className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </AdminCard>
      )}

      {showForm ? (
        <AdminCard
          title={editingProfile ? "Editar Perfil" : "Novo Perfil"}
          variant="elevated"
        >
          <ProfileForm
            user={{
              id: user.id,
              company: user.company,
              email: user.email,
              name: user.name,
            }}
            profile={editingProfile}
            allPermissions={allPermissions}
            allCompanies={allCompanies}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </AdminCard>
      ) : (
        <div className="space-y-8">
          {/* Ações principais */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Perfis da Empresa
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure perfis de acesso e suas permissões
              </p>
            </div>

            {permissions.canCreate && (
              <AdminButton
                onClick={handleCreateProfile}
                icon={<PlusIcon />}
                variant="primary"
              >
                Novo Perfil
              </AdminButton>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total de Perfis"
              value={profiles.length}
              icon={<ProfilesIcon />}
              color="blue"
              description="Perfis cadastrados"
            />

            <StatsCard
              title="Perfis Ativos"
              value={profiles.filter((p) => p.isActive).length}
              icon={<CheckCircleIcon />}
              color="green"
              description="Perfis ativos e funcionais"
            />

            <StatsCard
              title="Usuários com Perfil"
              value={profiles.reduce(
                (total, profile) => total + profile.userCount,
                0
              )}
              icon={<UsersIcon />}
              color="purple"
              description="Usuários com perfis atribuídos"
            />
          </div>

          {/* Lista de perfis */}
          <ProfileList
            profiles={profiles}
            permissions={permissions}
            onEdit={handleEditProfile}
            onDelete={handleDeleteProfile}
          />
        </div>
      )}
    </AdminLayout>
  );
}