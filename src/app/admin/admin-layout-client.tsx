// src/app/admin/admin-layout-client.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  profile: string;
}

interface Permissions {
  canViewUsers: boolean;
  canViewProfiles: boolean;
  canManageDashboards: boolean;
  isAdmin: boolean;
}

interface Props {
  user: User;
  permissions: Permissions;
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  permission: keyof Permissions;
  description: string;
}

export default function AdminLayoutClient({
  user,
  permissions,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      id: "company",
      name: "Empresa",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M9 7h6m-6 4h6m-2 4h2M7 7h2v2H7V7z",
      href: "/admin/company",
      permission: "isAdmin",
      description: "Configurações da empresa",
    },
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header do sidebar */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
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
              <h1 className="text-lg font-bold text-gray-900">Admin</h1>
            </div>

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

          {/* Informações do usuário */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.profile}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">{user.company}</p>
            </div>
          </div>

          {/* Menu de navegação */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {/* Link para Dashboard principal */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                />
              </svg>
              <span>Dashboard Principal</span>
            </Link>

            <div className="border-t border-gray-200 pt-2 mt-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Administração
              </p>

              {visibleMenuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveRoute(item.href)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
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
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer do sidebar */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
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
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-0">
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
              Administração
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
