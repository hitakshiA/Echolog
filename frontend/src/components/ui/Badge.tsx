import type { ReactNode } from 'react'
import type { BadgeVariant } from './badge-variants'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-600',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-violet-50 text-violet-700',
  neutral: 'bg-stone-100 text-stone-500',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
