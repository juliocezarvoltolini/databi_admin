// src/app/admin/dashboards/dashboards-client.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardForm from "./dashboard-form";
import DashboardList from "./dashboard-list";
import { Company } from "@/generated/prisma";
import { 
  AdminLayout, 
  PageHeader, 
  StatsCard, 
  AdminCard, 
  AdminButton, 
  LoadingSpinner,
  DashboardIcon,
  CheckCircleIcon,
  LinkIcon,
  PlusIcon
} from "@/components/admin";

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
    return <LoadingSpinner fullScreen message="Carregando dashboards..." />;
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Gestão de Dashboards"
        subtitle="Gerencie os dashboards do Power BI da empresa"
        icon={<DashboardIcon />}
      />

      {error && (
        <AdminCard variant="elevated" className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </AdminCard>
      )}

      {showForm ? (
        <AdminCard
          title={editingDashboard ? "Editar Dashboard" : "Novo Dashboard"}
          variant="elevated"
        >
          <DashboardForm
            dashboard={editingDashboard}
            allCompanies={allCompanies}
            currentUserCompanyId={user.company?.id}
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
                Dashboards da Empresa
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure dashboards do Power BI para sua empresa
              </p>
            </div>

            {permissions.canCreate && (
              <AdminButton
                onClick={handleCreateDashboard}
                icon={<PlusIcon />}
                variant="primary"
              >
                Novo Dashboard
              </AdminButton>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total de Dashboards"
              value={dashboards.length}
              icon={<DashboardIcon />}
              color="blue"
              description="Dashboards cadastrados"
            />

            <StatsCard
              title="Dashboards Ativos"
              value={dashboards.filter((d) => d.isActive).length}
              icon={<CheckCircleIcon />}
              color="green"
              description="Dashboards ativos e funcionais"
            />

            <StatsCard
              title="Links Configurados"
              value={dashboards.filter((d) => d.powerbiUrl).length}
              icon={<LinkIcon />}
              color="purple"
              description="Dashboards com URLs do Power BI"
            />
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
    </AdminLayout>
  );
}