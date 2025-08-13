// src/app/admin/profiles/profiles-client.tsx
"use client";

import { useState, useEffect } from "react";
import ProfileForm from "./profile.form";
import ProfileList from "./profile-list";


interface User {
  id: string;
  name: string;
  email: string;
  company: string;
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Perfis</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie os perfis de acesso e suas permissões na empresa
        </p>
      </div>

      {error && <div className="alert-error mb-6">{error}</div>}

      {showForm ? (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              {editingProfile ? "Editar Perfil" : "Novo Perfil"}
            </h2>
          </div>

          <ProfileForm
            profile={editingProfile}
            allPermissions={allPermissions}
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
                Perfis da Empresa
              </h2>
              <p className="text-sm text-gray-600">
                Configure perfis de acesso e suas permissões
              </p>
            </div>

            {permissions.canCreate && (
              <button onClick={handleCreateProfile} className="btn-primary">
                + Novo Perfil
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total de Perfis
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profiles.length}
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
                    Perfis Ativos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profiles.filter((p) => p.isActive).length}
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Usuários com Perfil
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profiles.reduce(
                      (total, profile) => total + profile.userCount,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
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
    </div>
  );
}
