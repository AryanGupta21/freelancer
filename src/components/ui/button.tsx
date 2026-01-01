import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseClasses = 'button-base'

    const variants = {
      primary: 'button-primary',
      secondary: 'button-secondary',
      outline: 'button-outline',
      ghost: 'button-ghost'
    }

    const sizes = {
      sm: 'button-sm',
      md: 'button-md',
      lg: 'button-lg'
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
