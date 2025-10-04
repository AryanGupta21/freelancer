import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="input-container">
        {label && (
          <label className="input-label">
            {label}
            {props.required && <span className="input-required">*</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'input-field',
            error && 'input-field-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="input-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }