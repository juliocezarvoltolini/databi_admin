// src/app/admin/admin-layout-client.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Company, Dashboard, User } from "@/generated/prisma";
import { PermissionsEnum, UserClient } from "./layout";




interface Props {
  user: UserClient;
  permissions: PermissionsEnum;
  companyDashboards: Dashboard[];
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  permission: string;
  description: string;
}

export default function AdminLayoutClient({
  user,
  permissions,
  companyDashboards,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();


  // Menu items baseados em permissões
  const menuItems: MenuItem[] = [
    {
      id: "users",
      name: "Usuários",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      href: "/admin/users",
      permission: "canViewUsers",
      description: "Gerenciar usuários da empresa",
    },
    {
      id: "profiles",
      name: "Perfis",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      href: "/admin/profiles",
      permission: "canViewProfiles",
      description: "Gerenciar perfis e permissões",
    },
    {
      id: "dashboards",
      name: "Dashboards",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      href: "/admin/dashboards",
      permission: "canManageDashboards",
      description: "Gerenciar dashboards Power BI",
    },
    {
      id: "companies",
      name: "Empresas",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      href: "/admin/companies",
      permission: "canViewCompanies",
      description: "Gerenciar empresas do sistema",
    }
  ];

  // Filtrar itens baseado nas permissões
  const visibleMenuItems = menuItems.filter(
    (item) => permissions[item.permission]
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header do sidebar */}
          <div className={`flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/Logo DataBi - Branco.svg"
                  alt="DataBi Logo"
                  className="w-8 h-8"
                />
              </div>
              {!sidebarCollapsed && <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">DataBi Admin</h1>}
            </div>

            <div className="flex items-center space-x-1">
              {/* Botão de colapsar (desktop) */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
                className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
          <div className={`py-4 border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </p>
                  {user.profileId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.profile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
            {!sidebarCollapsed && user.company && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.company.name}</p>
              </div>
            )}
          </div>

          {/* Menu de navegação */}
          <nav className={`flex-1 py-4 space-y-2 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
            {/* Dashboards da Empresa */}
            {companyDashboards.length > 0 && (
              <div>
                {!sidebarCollapsed && (
                  <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Dashboards
                  </p>
                )}
                <div className="space-y-1">
                  {companyDashboards.map((dashboard) => (
                    <Link
                      key={dashboard.id}
                      href={`/admin/dashboard/${dashboard.id}`}
                      className={`flex items-center transition-colors group ${
                        sidebarCollapsed 
                          ? 'justify-center p-2 rounded-md' 
                          : 'space-x-3 px-3 py-2 rounded-md'
                      } ${
                        pathname === `/admin/dashboard/${dashboard.id}`
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
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

            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Administração
                </p>
              )}

              {visibleMenuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center transition-colors ${
                    sidebarCollapsed 
                      ? 'justify-center p-2 rounded-md' 
                      : 'space-x-3 px-3 py-2 rounded-md'
                  } ${
                    isActiveRoute(item.href)
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
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
                      d={item.icon}
                    />
                  </svg>
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer do sidebar */}
          <div className={`border-t border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors ${
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
      <div className="flex-1 lg:ml-0">
        {/* Header mobile */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Administração
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 h-screen overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
