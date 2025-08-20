// src/components/admin/AdminCard.tsx
"use client";

interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'bordered';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const variantStyles = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
  bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
};

export default function AdminCard({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  padding = 'md',
  variant = 'default'
}: AdminCardProps) {
  const hasHeader = title || subtitle || headerAction;

  return (
    <div className={`
      rounded-xl 
      ${variantStyles[variant]} 
      transition-all duration-200 
      hover:shadow-md 
      dark:hover:shadow-gray-900/10
      ${className}
    `}>
      {hasHeader && (
        <div className={`
          border-b border-gray-200 dark:border-gray-700
          ${padding === 'none' ? 'p-6' : paddingStyles[padding]}
          ${padding === 'none' ? 'pb-6' : ''}
        `}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0 ml-4">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={hasHeader && padding !== 'none' ? paddingStyles[padding] : (padding !== 'none' ? paddingStyles[padding] : '') + `overflow-auto`}>
        {children}
      </div>
    </div>
  );
}