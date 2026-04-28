import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'success'
}

export function Progress({ className, value, variant = 'default', ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        'relative h-2.5 w-full overflow-hidden rounded-full bg-[#1a1a1a]',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 transition-all duration-700 ease-out rounded-full',
          variant === 'success'
            ? 'bg-[hsl(155,60%,50%)]'
            : 'bg-white'
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}
