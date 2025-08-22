// src/app/admin/users/users-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserForm from "./user-form";
import UserList from "./user-list";
import { Profile } from "@/generated/prisma";
import {
  AdminLayout,
  PageHeader,
  StatsCard,
  AdminCard,
  AdminButton,
  LoadingSpinner,
  UsersIcon,
  CheckCircleIcon,
  ProfilesIcon,
  PlusIcon,
} from "@/components/admin";
import {
  CompanyClient,
  PermissionVerbs,
  ProfileClient,
  UserClient,
} from "../layout";

interface Props {
  user: UserClient;
  permissions: PermissionVerbs;
  isSystemAdmin: boolean;
}

export default function UsersClient({
  user,
  permissions,
  isSystemAdmin,
}: Props) {
  const [users, setUsers] = useState<UserClient[]>([]);
  const [profiles, setProfiles] = useState<ProfileClient[]>([]);
  const [companies, setCompanies] = useState<CompanyClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserClient | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar usuários
      const usersResponse = await fetch("/api/users");
      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        if (usersResult.success) {
          setUsers(usersResult.data);
        }
      }

      // Carregar perfis
      const profilesResponse = await fetch("/api/profiles");
      if (profilesResponse.ok) {
        const profilesResult = await profilesResponse.json();
        if (profilesResult.success) {
          setProfiles(profilesResult.data);
        }
      }

      // Carregar empresas (apenas para administradores do sistema)
      if (isSystemAdmin) {
        const companiesResponse = await fetch("/api/companies");
        if (companiesResponse.ok) {
          const companiesResult = await companiesResponse.json();
          if (companiesResult.success) {
            setCompanies(companiesResult.data);
          }
        }
      } else {
        setCompanies((value) => value.concat(user.company));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (userData: UserClient) => {
    setEditingUser(userData);
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja desativar este usuário?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await loadData(); // Recarregar lista
        alert("Usuário desativado com sucesso!");
      } else {
        alert(result.error || "Erro ao desativar usuário");
      }
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      alert("Erro ao desativar usuário");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
    loadData(); // Recarregar lista
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando usuários..." />;
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Gestão de Usuários"
        subtitle={
          user.company
            ? `${user.company.name} • Gerencie os usuários e suas permissões`
            : "Gerencie os usuários e suas permissões"
        }
        icon={<UsersIcon />}
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
          title={editingUser ? "Editar Usuário" : "Novo Usuário"}
          variant="elevated"
        >
          <UserForm
            userLogged={user}
            user={editingUser}
            profiles={profiles}
            companies={companies}
            isSystemAdmin={isSystemAdmin}
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
                Usuários da Empresa
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gerencie os usuários e suas permissões
              </p>
            </div>

            {permissions.canCreate && (
              <AdminButton
                onClick={handleCreateUser}
                icon={<PlusIcon />}
                variant="primary"
              >
                Novo Usuário
              </AdminButton>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total de Usuários"
              value={users.length}
              icon={<UsersIcon />}
              color="blue"
              description="Usuários cadastrados"
            />

            <StatsCard
              title="Usuários Ativos"
              value={users.filter((u) => u.isActive).length}
              icon={<CheckCircleIcon />}
              color="green"
              description="Usuários com acesso ativo"
            />

            <StatsCard
              title="Perfis Disponíveis"
              value={profiles.length}
              icon={<ProfilesIcon />}
              color="purple"
              description="Perfis de acesso configurados"
            />
          </div>

          {/* Lista de usuários */}
          <UserList
            users={users}
            profiles={profiles}
            permission={permissions}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </div>
      )}
    </AdminLayout>
  );
}
