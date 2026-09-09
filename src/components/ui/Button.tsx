import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'h-[38px] px-4 rounded-md text-[15px] font-medium inline-flex items-center justify-center gap-2 transition-all duration-fast ease-out select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:translate-y-[1px]';

  const variantClasses = {
    primary: 'bg-primary text-primary-fg hover:bg-primary-hover border-none font-semibold shadow-sm',
    secondary: 'bg-surface-2 text-text border border-border hover:bg-surface-3 hover:border-border-strong',
    accent: 'bg-accent text-[#201400] hover:brightness-105 border-none font-semibold shadow-sm',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary-soft',
    danger: 'bg-transparent text-danger border border-danger hover:bg-danger-soft',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
}

export default Button;
