import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(210,100%,60%)] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(210,100%,60%)] text-white hover:bg-[hsl(210,100%,66%)] shadow-sm shadow-[hsl(210,100%,60%)/20%]',
        secondary:
          'bg-[hsl(222,35%,11%)] border border-[hsl(222,20%,18%)] text-[hsl(210,20%,94%)] hover:bg-[hsl(222,30%,14%)] hover:border-[hsl(222,20%,26%)]',
        ghost:
          'text-[hsl(210,15%,55%)] hover:text-[hsl(210,20%,94%)] hover:bg-[hsl(222,35%,11%)]',
        danger:
          'bg-[hsl(355,75%,60%)]/10 border border-[hsl(355,75%,60%)]/30 text-[hsl(355,75%,60%)] hover:bg-[hsl(355,75%,60%)]/20',
        success:
          'bg-[hsl(155,60%,50%)]/10 border border-[hsl(155,60%,50%)]/30 text-[hsl(155,60%,50%)] hover:bg-[hsl(155,60%,50%)]/20',
      },
      size: {
        sm: 'h-7 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
