import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outlined' | 'ghost'
  loading?: boolean
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = 'primary', loading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-300 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50'
    const sizing = 'h-12 px-6 text-[15px]'

    const variants = {
      primary: 'bg-gold text-void hover:bg-gold-light border border-transparent shadow-[0_0_15px_rgba(191,155,48,0.15)] hover:shadow-[0_0_25px_rgba(191,155,48,0.3)]',
      outlined: 'bg-transparent text-gold border border-gold/50 hover:bg-gold/10 hover:border-gold',
      ghost: 'bg-transparent text-text-2 hover:text-gold-light gold-link'
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(baseStyles, sizing, variants[variant], className)}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && children}
      </button>
    )
  }
)
GoldButton.displayName = 'GoldButton'
