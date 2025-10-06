'use client';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
        case 'secondary':
          return 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500';
        case 'ghost':
          return 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 focus:ring-gray-500';
        case 'danger':
          return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
        case 'success':
          return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500';
        case 'warning':
          return 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500';
        default:
          return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'xs':
          return 'px-2 py-1 text-xs';
        case 'sm':
          return 'px-3 py-1.5 text-sm';
        case 'md':
          return 'px-4 py-2 text-sm';
        case 'lg':
          return 'px-6 py-3 text-base';
        case 'xl':
          return 'px-8 py-4 text-lg';
        default:
          return 'px-4 py-2 text-sm';
      }
    };

    const getIconSize = () => {
      switch (size) {
        case 'xs':
          return 'text-xs';
        case 'sm':
          return 'text-sm';
        case 'md':
          return 'text-sm';
        case 'lg':
          return 'text-base';
        case 'xl':
          return 'text-lg';
        default:
          return 'text-sm';
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
        {...props}
      >
        {loading && <i className='ri-loader-4-line animate-spin mr-2'></i>}

        {!loading && icon && iconPosition === 'left' && (
          <i
            className={`${icon} ${children ? 'mr-2' : ''} ${getIconSize()}`}
          ></i>
        )}

        {children}

        {!loading && icon && iconPosition === 'right' && (
          <i
            className={`${icon} ${children ? 'ml-2' : ''} ${getIconSize()}`}
          ></i>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
