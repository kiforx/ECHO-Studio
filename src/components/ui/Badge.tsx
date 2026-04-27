import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
}

const variantStyles = {
  default: 'bg-[hsl(210,100%,60%)]/15 text-[hsl(210,100%,60%)] border border-[hsl(210,100%,60%)]/25',
  success: 'bg-[hsl(155,60%,50%)]/15 text-[hsl(155,60%,50%)] border border-[hsl(155,60%,50%)]/25',
  warning: 'bg-[hsl(38,95%,58%)]/15 text-[hsl(38,95%,58%)] border border-[hsl(38,95%,58%)]/25',
  danger: 'bg-[hsl(355,75%,60%)]/15 text-[hsl(355,75%,60%)] border border-[hsl(355,75%,60%)]/25',
  muted: 'bg-[hsl(222,35%,11%)] text-[hsl(210,15%,55%)] border border-[hsl(222,20%,18%)]',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
