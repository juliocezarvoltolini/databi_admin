// src/app/admin/profiles/profile-list.tsx
"use client";

import { useEffect, useState } from "react";
import { PermissionVerbs, ProfileClient } from "../layout";

interface ProfileWithUserCount extends ProfileClient {
  userCount: number;
}


interface Props {
  profiles: ProfileWithUserCount[];
  permissions: PermissionVerbs;
  onEdit: (profile: ProfileClient) => void;
  onDelete: (profileId: string) => void;
}

export default function ProfileList({
  profiles,
  permissions,
  onEdit,
  onDelete,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

  // Filtrar perfis
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const toggleProfileExpansion = (profileId: string) => {
    setExpandedProfile(expandedProfile === profileId ? null : profileId);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      DASHBOARD:
        "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      USER: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      PROFILE:
        "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      SYSTEM: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    return (
      colors[category] ||
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    );
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      DASHBOARD: "Dashboard",
      USER: "Usuário",
      PROFILE: "Perfil",
      SYSTEM: "Sistema",
    };
    return names[category] || category;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Lista de Perfis ({filteredProfiles.length})
          </h3>

          {/* Busca */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar perfis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 min-w-64"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            Nenhum perfil encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "Tente ajustar os termos de busca."
              : "Comece criando um novo perfil."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header do perfil */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {profile.name}
                      </h4>

                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          profile.isActive
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {profile.isActive ? "Ativo" : "Inativo"}
                      </span>

                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        <svg
                          className="w-3 h-3 mr-1"
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
                        {profile.userCount} usuário(s)
                      </span>
                      {profile.company && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          empresa {profile.company.name}
                        </span>
                      )}
                    </div>

                    {profile.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {profile.description}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Criado em {formatDate(profile.createdAt)} •{" "}
                      {profile.permissions.length} permissão(ões)
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleProfileExpansion(profile.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                      title="Ver permissões"
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          expandedProfile === profile.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {permissions.canEdit && (
                      <button
                        onClick={() => onEdit(profile)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900"
                        title="Editar perfil"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}

                    {permissions.canDelete && profile.userCount === 0 && (
                      <button
                        onClick={() => onDelete(profile.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900"
                        title="Excluir perfil"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalhes (expandível) */}
              {expandedProfile === profile.id && (
                <div className="p-4 bg-white dark:bg-gray-800 space-y-6">
                  {/* Empresas */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Empresas associadas:
                    </h5>
                    {!profile.company ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nenhuma empresa associada
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          key={profile.company.id}
                          className="flex items-center space-x-3 p-2 border border-gray-100 rounded-md"
                        >
                          <div className="p-1 bg-purple-100 rounded">
                            <svg
                              className="w-4 h-4 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {profile.company.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {profile.company.slug}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Permissões */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-3">
                      Permissões deste perfil:
                    </h5>

                    {profile.permissions.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Nenhuma permissão atribuída
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {profile.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-3 p-2 border border-gray-100 rounded-md"
                          >
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                                permission.category
                              )}`}
                            >
                              {getCategoryName(permission.category)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {permission.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {permission.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
