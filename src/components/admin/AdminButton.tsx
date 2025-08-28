// src/components/admin/AdminButton.tsx
"use client";

interface AdminButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles = {
  primary: 'btn-primary',
  secondary: 'btn-secondary', 
  danger: 'btn-danger',
  success: 'btn-success',
  warning: 'btn-warning'
};

const sizeStyles = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg'
};

export default function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button'
}: AdminButtonProps) {
  const buttonClasses = `
    btn
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${disabled || loading ? 'loading' : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processando...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2 flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2 flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}