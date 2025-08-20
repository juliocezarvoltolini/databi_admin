// src/components/admin/AdminLayout.tsx
"use client";

interface AdminLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
};

export default function AdminLayout({ 
  children, 
  maxWidth = '7xl',
  className = '' 
}: AdminLayoutProps) {
  return (
    <div className={`
      min-h-screen 
      h-screen
      bg-gradient-to-br 
      from-gray-50 
      to-gray-100 
      dark:from-gray-900 
      dark:to-gray-800
      overflow-y-auto
      overflow-x-hidden
      ${className}
    `}>
      <div className={`
        mx-auto 
        px-4 
        sm:px-6 
        lg:px-8 
        py-8
        min-h-full
        ${maxWidthStyles[maxWidth]}
      `}>
        {children}
      </div>
    </div>
  );
}