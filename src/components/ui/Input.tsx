import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-lg border border-[hsl(222,20%,18%)] bg-[hsl(222,40%,8%)] px-3 py-1 text-sm text-[hsl(210,20%,94%)] placeholder:text-[hsl(210,10%,35%)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(210,100%,60%)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'
