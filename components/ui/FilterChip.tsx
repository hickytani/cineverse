import { ButtonHTMLAttributes, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  label: string
  selected?: boolean
}

export function FilterChip({ icon, label, selected = false, className, ...props }: FilterChipProps) {
  return (
    <button
      className={twMerge(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-sans transition-all duration-300',
        'border',
        selected 
          ? 'bg-gold text-void border-transparent shadow-[0_4px_15px_rgba(191,155,48,0.2)]' 
          : 'bg-bg-2 text-text-2 border-border-1 hover:border-gold/50 hover:text-gold-light',
        className
      )}
      {...props}
    >
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
