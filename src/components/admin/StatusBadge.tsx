// src/components/admin/StatusBadge.tsx
"use client";

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  active: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    dot: 'bg-green-400 dark:bg-green-500'
  },
  inactive: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-200',
    dot: 'bg-gray-400 dark:bg-gray-500'
  },
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-200',
    dot: 'bg-yellow-400 dark:bg-yellow-500'
  },
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-800 dark:text-emerald-200',
    dot: 'bg-emerald-400 dark:bg-emerald-500'
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    dot: 'bg-red-400 dark:bg-red-500'
  },
  warning: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-200',
    dot: 'bg-orange-400 dark:bg-orange-500'
  }
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-1',
    text: 'text-xs',
    dot: 'w-1.5 h-1.5'
  },
  md: {
    padding: 'px-2.5 py-1.5',
    text: 'text-sm',
    dot: 'w-2 h-2'
  },
  lg: {
    padding: 'px-3 py-2',
    text: 'text-base',
    dot: 'w-2.5 h-2.5'
  }
};

export default function StatusBadge({ 
  status, 
  children, 
  size = 'md',
  className = '' 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 
      ${sizeStyles.padding} 
      ${sizeStyles.text}
      font-medium 
      rounded-full 
      ${config.bg} 
      ${config.text}
      ${className}
    `}>
      <span className={`
        ${sizeStyles.dot} 
        ${config.dot} 
        rounded-full
      `} />
      {children}
    </span>
  );
}