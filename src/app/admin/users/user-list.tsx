// src/app/admin/users/user-list.tsx
"use client";

import { useState } from "react";

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

interface Profile {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
}

interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Props {
  users: UserData[];
  profiles: Profile[];
  permissions: Permissions;
  onEdit: (user: UserData) => void;
  onDelete: (userId: string) => void;
}

export default function UserList({
  users,
  profiles,
  permissions,
  onEdit,
  onDelete,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Filtrar usuários
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProfile = !filterProfile || user.profile?.id === filterProfile;

    const matchesStatus =
      !filterStatus ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesProfile && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Usuários ({filteredUsers.length})
          </h3>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Busca */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 min-w-64"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
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

            {/* Filtro por perfil */}
            <select
              value={filterProfile}
              onChange={(e) => setFilterProfile(e.target.value)}
              className="input-field min-w-48"
            >
              <option value="">Todos os perfis</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
              <option value="null">Sem perfil</option>
            </select>

            {/* Filtro por status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum usuário encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterProfile || filterStatus
              ? "Tente ajustar os filtros de busca."
              : "Comece criando um novo usuário."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden">
          {/* Versão desktop - tabela */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  {(permissions.canEdit || permissions.canDelete) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.profile ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.profile.description}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Sem perfil
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    {(permissions.canEdit || permissions.canDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {permissions.canEdit && (
                            <button
                              onClick={() => onEdit(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                          )}
                          {permissions.canDelete && user.isActive && (
                            <button
                              onClick={() => onDelete(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Desativar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão mobile - cards */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {user.name}
                    </h4>
                    <p className="text-sm text-gray-500">{user.email}</p>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Perfil:</span>
                        <span className="text-xs text-gray-900">
                          {user.profile?.name || "Sem perfil"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Status:</span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          Criado em:
                        </span>
                        <span className="text-xs text-gray-900">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(permissions.canEdit || permissions.canDelete) && (
                    <div className="flex flex-col space-y-2">
                      {permissions.canEdit && (
                        <button
                          onClick={() => onEdit(user)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Editar
                        </button>
                      )}
                      {permissions.canDelete && user.isActive && (
                        <button
                          onClick={() => onDelete(user.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Desativar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
