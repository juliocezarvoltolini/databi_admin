'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  company: string
  profile: string
}

interface Dashboard {
  id: string
  name: string
  description: string | null
  powerbiUrl: string
}

interface UserPermissions {
  canViewUsers: boolean
  canManageDashboards: boolean
  isAdmin: boolean
}

interface Props {
  user: User
  dashboards: Dashboard[]
  permissions?: UserPermissions
}

export default function DashboardClient({ user, dashboards, permissions }: Props) {
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Manager</h1>
              <p className="text-sm text-gray-600">{user.company}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Menu de administração */}
              {(permissions?.canViewUsers || permissions?.canManageDashboards || permissions?.isAdmin) && (
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Administração</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {permissions?.canViewUsers && (
                        <Link
                          href="/admin/users"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>Gestão de Usuários</span>
                        </Link>
                      )}
                      
                      {permissions?.canManageDashboards && (
                        <Link
                          href="/admin/dashboards"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Gestão de Dashboards</span>
                        </Link>
                      )}
                      
                      {permissions?.isAdmin && (
                        <>
                          <hr className="my-1 border-gray-200" />
                          <Link
                            href="/admin/profiles"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Gestão de Perfis</span>
                          </Link>
                          
                          <Link
                            href="/admin/company"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M9 7h6m-6 4h6m-2 4h2M7 7h2v2H7V7z" />
                            </svg>
                            <span>Configurações da Empresa</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.profile}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com lista de dashboards */}
          <div className="lg:col-span-1">
            <div className="dashboard-sidebar">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Dashboards Disponíveis
              </h2>
              
              {dashboards.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Nenhum dashboard disponível
                </p>
              ) : (
                <div className="space-y-2">
                  {dashboards.map((dashboard) => (
                    <button
                      key={dashboard.id}
                      onClick={() => setSelectedDashboard(dashboard)}
                      className={`dashboard-item ${
                        selectedDashboard?.id === dashboard.id
                          ? 'dashboard-item-active'
                          : ''
                      }`}
                    >
                      <div className="font-medium text-sm">{dashboard.name}</div>
                      {dashboard.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {dashboard.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área principal para exibir dashboard */}
          <div className="lg:col-span-3">
            <div className="dashboard-content">
              {selectedDashboard ? (
                <div>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedDashboard.name}
                    </h3>
                    {selectedDashboard.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedDashboard.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="iframe-container">
                      <iframe
                        src={selectedDashboard.powerbiUrl}
                        className="iframe-responsive"
                        title={selectedDashboard.name}
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="dashboard-empty">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione um Dashboard
                    </h3>
                    <p className="text-gray-500">
                      Escolha um dashboard da lista ao lado para visualizar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}