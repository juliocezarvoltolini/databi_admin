"use client";
// src/app/admin/profiles/profiles-client.tsx

import { useState, useEffect } from "react";
import ProfileForm from "./profile.form";
import ProfileList from "./profile-list";
import {
  Company,
  Dashboard,
  Permission,
  PrismaClient,
  Profile,
  User,
} from "@/generated/prisma";
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
  PlusIcon,
} from "@/components/admin";

import {
  CompanyClient,
  DashboardClient,
  PermissionClient,
  PermissionVerbs,
  ProfileClient,
  UserClient,
} from "../layout";

interface Props {
  user: UserClient;
  permissions: PermissionVerbs;
}

interface ProfileWithUserCount extends ProfileClient {
  userCount: number;
}

export default function ProfilesClient({ user, permissions }: Props) {
  const [profiles, setProfiles] = useState<ProfileWithUserCount[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionClient[]>([]);
  const [allCompanies, setAllCompanies] = useState<CompanyClient[]>([]);
  const [allDashboards, setAllDashboards] = useState<DashboardClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileClient | null>(
    null
  );
  const [error, setError] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      // Variável local para armazenar companies
      let companiesData: CompanyClient[] = [];

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

      // Carregar empresas
      if (user.profile.company) {
        const companyResponse = await fetch(
          `/api/companies/${user.profile.company.id}`
        );

        if (companyResponse.ok) {
          const companyResult = await companyResponse.json();
    
          if (companyResult.success) {
            companiesData = [companyResult.data]; // Use variável local
            setAllCompanies(companiesData);
          }
        }
      } else {
        const companiesResponse = await fetch("/api/companies");
        if (companiesResponse.ok) {
          const companiesResult = await companiesResponse.json();
          if (companiesResult.success) {
     
            companiesData = companiesResult.data; // Use variável local
            setAllCompanies(companiesData);
          }
        }
      }

      // Carregar dashboards
      const dashboardsResponse = await fetch("/api/dashboards");


      if (dashboardsResponse.ok) {
        const dashboardsResult = await dashboardsResponse.json();
        if (dashboardsResult.success) {
          setAllDashboards(dashboardsResult.data);
        }
      } else {
        // Agora use a variável local em vez do estado
        if (!user.profile.dashboards || user.profile.dashboards.length === 0) {
   
          if (companiesData.length > 0) {
            setAllDashboards(companiesData[0].dashboards || []);
          }
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

  const handleEditProfile = async (profile: ProfileClient) => {
    const response = await fetch(`/api/profiles/${profile.id}`, {
      method: "GET",
    });

    if (!response.ok) {
      setError("Erro ao carregar perfil para edição");
      return;
    }

    const data = await response.json();
    const profileData: ProfileClient = { ...data.data };
    console.log("Perfil carregado para edição:", data);

    setEditingProfile(profileData);
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
        <AdminCard
          variant="elevated"
          className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
        >
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </AdminCard>
      )}

      {showForm ? (
        <AdminCard
          title={editingProfile ? "Editar Perfil" : "Novo Perfil"}
          variant="elevated"
        >
          <ProfileForm
            user={user}
            profile={editingProfile}
            allPermissions={allPermissions}
            allDashboards={allDashboards}
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
