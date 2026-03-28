import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-accent to-accent-hover text-white shadow-[0_1px_3px_rgba(99,102,241,0.4)] hover:shadow-[0_2px_8px_rgba(99,102,241,0.4)] active:scale-[0.98]',
  secondary:
    'bg-surface text-text border border-border hover:bg-surface-hover hover:border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  danger:
    'bg-gradient-to-b from-danger to-red-600 text-white shadow-[0_1px_3px_rgba(239,68,68,0.4)]',
  ghost:
    'text-text-secondary hover:text-text hover:bg-surface-hover',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
