import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-text-secondary">{label}</label>
        )}
        <input
          ref={ref}
          className={`h-[38px] rounded-lg border border-border bg-white px-3 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
