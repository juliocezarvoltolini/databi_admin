// src/app/admin/companies/companies-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyForm from "./company-form";
import CompanyList from "./company-list";
import { Company } from "@/generated/prisma";
import { 
  AdminLayout, 
  PageHeader, 
  StatsCard, 
  AdminCard, 
  AdminButton, 
  LoadingSpinner,
  CompanyIcon,
  UsersIcon,
  DashboardIcon,
  CheckCircleIcon,
  PlusIcon
} from "@/components/admin";

interface User {
  id: string;
  name: string;
  email: string;
  company: Company;
}

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  userCount: number;
  dashboardCount: number;
  profileCount: number;
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

export default function CompaniesClient({ user, permissions }: Props) {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyData | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCompanies(result.data);
        } else {
          setError(result.error || "Erro ao carregar empresas");
        }
      } else {
        setError("Erro ao carregar empresas");
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

  const handleCreateCompany = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEditCompany = (companyData: CompanyData) => {
    setEditingCompany(companyData);
    setShowForm(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm("Tem certeza que deseja desativar esta empresa? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await loadData(); // Recarregar lista
        alert("Empresa desativada com sucesso!");
      } else {
        alert(result.error || "Erro ao desativar empresa");
      }
    } catch (error) {
      console.error("Erro ao desativar empresa:", error);
      alert("Erro ao desativar empresa");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCompany(null);
    loadData(); // Recarregar lista
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando empresas..." />;
  }

  // Calcular estatísticas
  const totalUsers = companies.reduce((sum, company) => sum + company.userCount, 0);
  const totalDashboards = companies.reduce((sum, company) => sum + company.dashboardCount, 0);

  return (
    <AdminLayout>
      <PageHeader
        title="Gestão de Empresas"
        subtitle="Gerencie as empresas e suas configurações no sistema"
        icon={<CompanyIcon />}
      />

      {error && (
        <AdminCard variant="elevated" className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </AdminCard>
      )}

      {showForm ? (
        <AdminCard
          title={editingCompany ? "Editar Empresa" : "Nova Empresa"}
          variant="elevated"
        >
          <CompanyForm
            company={editingCompany}
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
                Empresas do Sistema
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gerencie as empresas e suas configurações
              </p>
            </div>

            {permissions.canCreate && (
              <AdminButton
                onClick={handleCreateCompany}
                icon={<PlusIcon />}
                variant="primary"
              >
                Nova Empresa
              </AdminButton>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total de Empresas"
              value={companies.length}
              icon={<CompanyIcon />}
              color="blue"
              description="Empresas cadastradas"
            />

            <StatsCard
              title="Total de Usuários"
              value={totalUsers}
              icon={<UsersIcon />}
              color="green"
              description="Usuários em todas as empresas"
            />

            <StatsCard
              title="Total de Dashboards"
              value={totalDashboards}
              icon={<DashboardIcon />}
              color="purple"
              description="Dashboards configurados"
            />

            <StatsCard
              title="Empresas Ativas"
              value={companies.filter(c => c.isActive).length}
              icon={<CheckCircleIcon />}
              color="yellow"
              description="Empresas ativas no sistema"
            />
          </div>

          {/* Lista de empresas */}
          <CompanyList
            companies={companies}
            permissions={permissions}
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
          />
        </div>
      )}
    </AdminLayout>
  );
}