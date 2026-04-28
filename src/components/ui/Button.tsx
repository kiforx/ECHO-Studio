import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-white text-[#111111] hover:bg-[#f0f0f0] shadow-sm shadow-white/10',
        secondary:
          'bg-[#1a1a1a] border border-[#272727] text-[#efefef] hover:bg-[#222222] hover:border-[#383838]',
        ghost:
          'text-[#858585] hover:text-[#efefef] hover:bg-[#1a1a1a]',
        danger:
          'bg-[hsl(355,75%,60%)]/10 border border-[hsl(355,75%,60%)]/30 text-[hsl(355,75%,60%)] hover:bg-[hsl(355,75%,60%)]/20',
        success:
          'bg-[hsl(155,60%,50%)]/10 border border-[hsl(155,60%,50%)]/30 text-[hsl(155,60%,50%)] hover:bg-[hsl(155,60%,50%)]/20',
      },
      size: {
        sm: 'h-8 px-4 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
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
