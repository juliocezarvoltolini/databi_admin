// src/app/admin/companies/companies-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyForm from "./company-form";
import CompanyList from "./company-list";
import { Company } from "@/generated/prisma";

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const totalUsers = companies.reduce((sum, company) => sum + company.userCount, 0);
  const totalDashboards = companies.reduce((sum, company) => sum + company.dashboardCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
             
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestão de Empresas
                </h1>
                <p className="text-sm text-gray-600">Administração do sistema</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Administrador</p>
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {showForm ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {editingCompany ? "Editar Empresa" : "Nova Empresa"}
              </h2>
            </div>

            <CompanyForm
              company={editingCompany}
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
                  Empresas do Sistema
                </h2>
                <p className="text-sm text-gray-600">
                  Gerencie as empresas e suas configurações
                </p>
              </div>

              {permissions.canCreate && (
                <button 
                  onClick={handleCreateCompany} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + Nova Empresa
                </button>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total de Empresas
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {companies.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total de Usuários
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total de Dashboards
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalDashboards}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Empresas Ativas
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {companies.filter(c => c.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
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
      </div>
    </div>
  );
}