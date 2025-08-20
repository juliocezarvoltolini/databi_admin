"use client";

import { useState } from "react";

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  powerbiUrl: string;
  isActive: boolean;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  company: {
    id: string;
    name: string;
    slug: string;
  } | null;
  profile: {
    id: string;
    name: string;
  };
}

interface Props {
  dashboard: Dashboard;
  user: User;
}

export default function DashboardViewer({ dashboard }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 dark:bg-black">
        {/* Header ultra-minimalista para fullscreen */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-3 py-1.5">
            <div className="flex justify-between items-center">
              <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {dashboard.name}
              </h1>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">Online</span>
                </div>
                
                <button
                  onClick={toggleFullscreen}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Sair da tela cheia"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard em tela cheia com máxima otimização */}
        <div className="h-[calc(100vh-3rem)] overflow-hidden">
          <iframe
            src={dashboard.powerbiUrl}
            className="border-none"
            title={`Dashboard: ${dashboard.name}`}
            allowFullScreen
            style={{ 
              width: '100vw',
              height: 'calc(100vh - 3rem + 60px)',
              border: 'none'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header do dashboard - altura mínima otimizada */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-1.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {dashboard.name}
            </h1>
            {dashboard.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">{dashboard.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">Online</span>
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Tela cheia"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8l4-4m0 0h4m-4 0v4m12-4l-4 4m0 0v4m0-4h4m-8 8l4 4m0 0v-4m0 4h-4m-8 0l4-4m0 0h-4m4 0v-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content - maximizar espaço */}
      <div className="admin-dashboard-content bg-white dark:bg-gray-800 overflow-hidden">
        <iframe
          src={dashboard.powerbiUrl}
          className="powerbi-iframe border-none"
          title={`Dashboard: ${dashboard.name}`}
          allowFullScreen
          style={{ 
            width: '100%',
            height: 'calc(100% + 60px)',
            border: 'none'
          }}
        />
      </div>
    </div>
  );
}