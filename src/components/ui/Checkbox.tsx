import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Checkbox({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer h-4 w-4 shrink-0 rounded border border-[hsl(222,20%,26%)] bg-[hsl(222,40%,8%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(210,100%,60%)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[hsl(210,100%,60%)] data-[state=checked]:border-[hsl(210,100%,60%)] cursor-pointer transition-colors',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        <Check className="h-3 w-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
