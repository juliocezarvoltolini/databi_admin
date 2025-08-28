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


const variantStyles = {
  default: 'card',
  elevated: 'card shadow-lg',
  bordered: 'card border-2'
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
      ${padding === 'none' ? 'card p-0' : variantStyles[variant]} 
      hover:shadow-md 
      ${className}
    `}>
      {hasHeader && (
        <div className={`
          card-header
          ${padding === 'none' ? 'p-6 pb-4' : ''}
        `}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
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
      
      <div className={`${hasHeader ? '' : (padding !== 'none' ? 'p-6' : '')} overflow-auto`}>
        {children}
      </div>
    </div>
  );
}