"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserSession } from "@/lib/types";

export default function WelcomePage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleDashboardNavigation = async () => {
    try {
      const response = await fetch("/api/dashboards/first");
 
      if (response.ok) {
        const result = await response.json();
        console.log("Dashboard encontrado, redirecionando...", result);
        
        if (result.success && result.data) {
          router.push(`/dashboard/${result.data.id}`);
        } else {
          router.push("/admin");
        }
      } else {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      router.push("/admin");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header de Boas-vindas */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
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
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo ao Dashboard Manager!
            </h1>
            {user && (
              <p className="text-xl text-gray-600 mb-2">
                Olá, <span className="font-semibold text-blue-600">{user.name}</span>!
              </p>
            )}
            <p className="text-gray-500">
              Gerencie seus dashboards e acompanhe suas métricas de forma eficiente
            </p>
          </div>

          {/* Cards de Ações */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div 
              onClick={() => router.push("/admin")}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100 p-6"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Administração
              </h3>
              <p className="text-gray-600 text-sm">
                Gerencie usuários, perfis, empresas e configurações do sistema
              </p>
            </div>

            <div 
              onClick={handleDashboardNavigation}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100 p-6"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dashboards
              </h3>
              <p className="text-gray-600 text-sm">
                Acesse e visualize seus dashboards personalizados
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Meu Perfil
              </h3>
              <p className="text-gray-600 text-sm">
                Atualize suas informações pessoais e preferências
              </p>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resumo do Sistema
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="border-r border-gray-200 last:border-r-0">
                <div className="text-2xl font-bold text-blue-600">Dashboard</div>
                <div className="text-sm text-gray-500">Manager v1.0</div>
              </div>
              <div className="border-r border-gray-200 last:border-r-0">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-gray-500">Status do Sistema</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Date().toLocaleDateString("pt-BR")}
                </div>
                <div className="text-sm text-gray-500">Data Atual</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                router.push("/login");
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sair do Sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}