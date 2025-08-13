"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Company, Profile } from "@/generated/prisma";

interface User {
  id: string;
  name: string;
  email: string;
  company: Company;
  profile: Profile;
}

interface Permissions {
  canViewUsers: boolean;
  canViewProfiles: boolean;
  canManageDashboards: boolean;
  canViewCompanies: boolean;
  isAdmin: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  powerbiUrl: string;
}

interface Props {
  user: User;
  permissions: Permissions;
  companyDashboards: Dashboard[];
  children: React.ReactNode;
}

export default function DashboardLayoutClient({
  user,
  permissions,
  companyDashboards,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const isDashboardActive = (dashboardId: string) => {
    return pathname === `/dashboard/${dashboardId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header do sidebar */}
          <div className={`flex items-center justify-between h-16 border-b border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              {!sidebarCollapsed && <h1 className="text-lg font-bold text-gray-900">Dashboards</h1>}
            </div>

            <div className="flex items-center space-x-1">
              {/* Botão de colapsar (desktop) */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-1 text-gray-400 hover:text-gray-600"
                title={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
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
                    d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"}
                  />
                </svg>
              </button>
              
              {/* Botão de fechar (mobile) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Informações do usuário */}
          <div className={`py-4 border-b border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  {user.profile && (
                    <p className="text-xs text-gray-500 truncate">
                      {user.profile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
            {!sidebarCollapsed && user.company && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">{user.company.name}</p>
              </div>
            )}
          </div>

          {/* Menu de navegação */}
          <nav className={`flex-1 py-4 space-y-2 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
            {/* Dashboards da Empresa */}
            {companyDashboards.length > 0 && (
              <div>
                {!sidebarCollapsed && (
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Seus Dashboards
                  </p>
                )}
                <div className="space-y-1">
                  {companyDashboards.map((dashboard) => (
                    <Link
                      key={dashboard.id}
                      href={`/dashboard/${dashboard.id}`}
                      className={`flex items-center transition-colors group ${
                        sidebarCollapsed 
                          ? 'justify-center p-2 rounded-md' 
                          : 'space-x-3 px-3 py-2 rounded-md'
                      } ${
                        isDashboardActive(dashboard.id)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title={sidebarCollapsed ? dashboard.name : undefined}
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">{dashboard.name}</span>
                          <svg
                            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Links rápidos */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Administração
                </p>
              )}

              <Link
                href="/admin"
                className={`flex items-center transition-colors ${
                  sidebarCollapsed 
                    ? 'justify-center p-2 rounded-md' 
                    : 'space-x-3 px-3 py-2 rounded-md'
                } text-gray-600 hover:text-gray-900 hover:bg-gray-100`}
                title={sidebarCollapsed ? "Admin" : undefined}
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {!sidebarCollapsed && <span className="text-sm font-medium">Admin</span>}
              </Link>
            </div>
          </nav>

          {/* Footer do sidebar */}
          <div className={`border-t border-gray-200 p-2 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full text-red-600 rounded-md hover:bg-red-50 transition-colors ${
                sidebarCollapsed 
                  ? 'justify-center p-2' 
                  : 'space-x-3 px-3 py-2'
              }`}
              title={sidebarCollapsed ? "Sair" : undefined}
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1">
        {/* Header mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Dashboard
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="h-screen">{children}</main>
      </div>
    </div>
  );
}