// src/app/admin/users/users-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserForm from "./user-form";
import UserList from "./user-list";
import { Profile } from "@/generated/prisma";


interface User {
  id: string;
  name: string;
  email: string;
  company: Company;
  profile: Profile;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  profile: {
    id: string;
    name: string;
    description: string;
  } | null;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Props {
  user: User;
  permissions: UserPermissions;
  isSystemAdmin: boolean;
}

export default function UsersClient({ user, permissions, isSystemAdmin }: Props) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
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

  const handleEditUser = (userData: UserData) => {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
             
             
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestão de Usuários
                </h1>
                {user.company && (
                  <p className="text-sm text-gray-600">{user.company.name}</p>
                )}
              
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.profile.name}</p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && <div className="alert-error mb-6">{error}</div>}

        {showForm ? (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h2>
            </div>

            <UserForm
              user={editingUser}
              profiles={profiles}
              companies={companies}
              isSystemAdmin={isSystemAdmin}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ações principais */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Usuários da Empresa
                </h2>
                <p className="text-sm text-gray-600">
                  Gerencie os usuários e suas permissões
                </p>
              </div>

              {permissions.canCreate && (
                <button onClick={handleCreateUser} className="btn-primary">
                  + Novo Usuário
                </button>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total de Usuários
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Usuários Ativos
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter((u) => u.isActive).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Perfis Disponíveis
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {profiles.length}
                    </p>
                  </div>
                </div>
              </div>
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
      </div>
    </div>
  );
}
