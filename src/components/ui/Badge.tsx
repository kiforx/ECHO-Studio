import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
}

const variantStyles = {
  default: 'bg-white/15 text-white border border-white/25',
  success: 'bg-[hsl(155,60%,50%)]/15 text-[hsl(155,60%,50%)] border border-[hsl(155,60%,50%)]/25',
  warning: 'bg-[hsl(38,95%,58%)]/15 text-[hsl(38,95%,58%)] border border-[hsl(38,95%,58%)]/25',
  danger: 'bg-[hsl(355,75%,60%)]/15 text-[hsl(355,75%,60%)] border border-[hsl(355,75%,60%)]/25',
  muted: 'bg-[#1a1a1a] text-[#858585] border border-[#272727]',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
