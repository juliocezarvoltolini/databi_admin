// src/app/admin/dashboards/dashboards-client.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardForm from "./dashboard-form";
import DashboardList from "./dashboard-list";
import { Company } from "@/generated/prisma";

interface User {
  id: string;
  name: string;
  email: string;
  company: Company;
}

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
  user: User;
  permissions: Permissions;
}

export default function DashboardsClient({ user, permissions }: Props) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar dashboards e empresas em paralelo
      const [dashboardsResponse, companiesResponse] = await Promise.all([
        fetch("/api/dashboards"),
        fetch("/api/companies")
      ]);

      if (dashboardsResponse.ok) {
        const dashboardsResult = await dashboardsResponse.json();
        if (dashboardsResult.success) {
          setDashboards(dashboardsResult.data);
        }
      } else {
        setError("Erro ao carregar dashboards");
      }

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

  const handleCreateDashboard = () => {
    setEditingDashboard(null);
    setShowForm(true);
  };

  const handleEditDashboard = (dashboard: Dashboard) => {
    setEditingDashboard(dashboard);
    setShowForm(true);
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (!confirm("Tem certeza que deseja excluir este dashboard?")) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await loadData(); // Recarregar lista
        alert("Dashboard excluído com sucesso!");
      } else {
        alert(result.error || "Erro ao excluir dashboard");
      }
    } catch (error) {
      console.error("Erro ao excluir dashboard:", error);
      alert("Erro ao excluir dashboard");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingDashboard(null);
    loadData(); // Recarregar lista
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingDashboard(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Dashboards</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie os dashboards do Power BI da empresa
        </p>
      </div>

      {error && <div className="alert-error mb-6">{error}</div>}

      {showForm ? (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              {editingDashboard ? "Editar Dashboard" : "Novo Dashboard"}
            </h2>
          </div>

          <DashboardForm
            dashboard={editingDashboard}
            allCompanies={allCompanies}
            currentUserCompanyId={user.company?.id}
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
                Dashboards da Empresa
              </h2>
              <p className="text-sm text-gray-600">
                Configure dashboards do Power BI para sua empresa
              </p>
            </div>

            {permissions.canCreate && (
              <button onClick={handleCreateDashboard} className="btn-primary">
                + Novo Dashboard
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total de Dashboards
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboards.length}
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
                    Dashboards Ativos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboards.filter((d) => d.isActive).length}
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Links Configurados
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboards.filter((d) => d.powerbiUrl).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de dashboards */}
          <DashboardList
            dashboards={dashboards}
            permissions={permissions}
            onEdit={handleEditDashboard}
            onDelete={handleDeleteDashboard}
          />
        </div>
      )}
    </div>
  );
}