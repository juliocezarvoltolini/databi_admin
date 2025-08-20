// src/components/admin/PageHeader.tsx
"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  action, 
  icon 
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg">
              <div className="w-6 h-6 text-white">
                {icon}
              </div>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}