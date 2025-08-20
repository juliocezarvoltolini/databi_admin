// src/components/admin/LoadingSpinner.tsx
"use client";

import AdminLayout from './AdminLayout';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  message?: string;
  fullScreen?: boolean;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const colorStyles = {
  blue: 'border-blue-600',
  white: 'border-white',
  gray: 'border-gray-600'
};

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  message,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <>
      <div className={`
        animate-spin 
        rounded-full 
        border-b-2 
        ${sizeStyles[size]} 
        ${colorStyles[color]}
        mx-auto
      `} />
      {message && (
        <p className={`
          mt-4 
          text-sm 
          ${color === 'white' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}
        `}>
          {message}
        </p>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            {spinner}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        {spinner}
      </div>
    </div>
  );
}