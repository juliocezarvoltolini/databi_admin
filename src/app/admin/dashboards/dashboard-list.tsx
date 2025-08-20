// src/app/admin/dashboards/dashboard-list.tsx
"use client";

import { useState } from "react";

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  powerbiUrl: string;
  isActive: boolean;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Props {
  dashboards: Dashboard[];
  permissions: Permissions;
  onEdit: (dashboard: Dashboard) => void;
  onDelete: (dashboardId: string) => void;
}

export default function DashboardList({
  dashboards,
  permissions,
  onEdit,
  onDelete,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDashboard, setExpandedDashboard] = useState<string | null>(null);

  // Filtrar dashboards
  const filteredDashboards = dashboards.filter(
    (dashboard) =>
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dashboard.description && dashboard.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpanded = (dashboardId: string) => {
    setExpandedDashboard(expandedDashboard === dashboardId ? null : dashboardId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDashboard = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {filteredDashboards.length} dashboard(s) encontrado(s)
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar dashboards..."
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
        </div>
      </div>

      {filteredDashboards.length === 0 ? (
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum dashboard encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Tente ajustar os termos de busca."
              : "Comece criando um novo dashboard."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header do dashboard */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {dashboard.name}
                      </h4>

                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          dashboard.isActive
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {dashboard.isActive ? "Ativo" : "Inativo"}
                      </span>

                      
                    </div>

                    {dashboard.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {dashboard.description}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Criado em {formatDate(dashboard.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleExpanded(dashboard.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      title="Ver detalhes"
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${
                          expandedDashboard === dashboard.id ? "rotate-180" : ""
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
                        onClick={() => onEdit(dashboard)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900"
                        title="Editar dashboard"
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

                    {permissions.canDelete && (
                      <button
                        onClick={() => onDelete(dashboard.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900"
                        title="Excluir dashboard"
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

              {/* Detalhes expandidos */}
              {expandedDashboard === dashboard.id && (
                <div className="p-4 bg-white space-y-4">
                  {/* URL do Power BI */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      URL do Power BI:
                    </h5>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-sm bg-gray-100 p-2 rounded border break-all">
                        {dashboard.powerbiUrl}
                      </code>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(dashboard.powerbiUrl)
                        }
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                        title="Copiar URL"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Preview do iframe */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Preview do Dashboard:
                    </h5>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={dashboard.powerbiUrl}
                        className="w-full h-96"
                        frameBorder="0"
                        allowFullScreen={true}
                        title={dashboard.name}
                      />
                    </div>
                  </div>

                  {/* Informações técnicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">ID:</span>
                      <span className="ml-2 font-mono text-gray-900">
                        {dashboard.id}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">
                        Empresa:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {dashboard.company.name}
                      </span>
                    </div>
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