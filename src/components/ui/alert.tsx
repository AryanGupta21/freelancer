import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
}

export function Alert({ type = 'info', title, children, className }: AlertProps) {
  const styles = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error'
  }

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle
  }

  const Icon = icons[type]

  return (
    <div className={cn('alert', styles[type], className)}>
      <div className="flex">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="ml-3">
          {title && (
            <h3 className="alert-title">{title}</h3>
          )}
          <div className={cn('alert-content', title && 'alert-content-with-title')}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}