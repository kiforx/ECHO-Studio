import { useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  className,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((o) => o.value === value)
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border border-[hsl(222,20%,18%)] bg-[hsl(222,40%,8%)] px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,60%)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            selected ? 'text-[hsl(210,20%,94%)]' : 'text-[hsl(210,10%,35%)]',
            className
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[hsl(210,15%,55%)]" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-xl border border-[hsl(222,20%,18%)] bg-[hsl(222,35%,11%)] shadow-xl shadow-black/30 animate-in fade-in-0 zoom-in-95"
          sideOffset={4}
          align="start"
        >
          <div className="flex items-center border-b border-[hsl(222,20%,18%)] px-3 py-2">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-[hsl(210,15%,55%)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-[hsl(210,20%,94%)] placeholder:text-[hsl(210,10%,35%)] focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-xs text-[hsl(210,15%,55%)]">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-[hsl(210,20%,94%)] hover:bg-[hsl(222,30%,14%)] focus:outline-none"
                >
                  {opt.value === value && (
                    <span className="absolute left-2">
                      <Check className="h-3.5 w-3.5 text-[hsl(210,100%,60%)]" />
                    </span>
                  )}
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
