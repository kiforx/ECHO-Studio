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
            'flex h-10 w-full items-center justify-between rounded-lg border border-[#272727] bg-[#111111] px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent hover:border-[#383838] hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            selected ? 'text-[#efefef]' : 'text-[#4a4a4a]',
            className
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#858585]" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 min-w-[var(--radix-popover-trigger-width)] w-[380px] rounded-xl border border-[#272727] bg-[#1a1a1a] shadow-2xl shadow-black/60 animate-in fade-in-0 zoom-in-95 duration-150"
          sideOffset={4}
          align="start"
        >
          <div className="flex items-center border-b border-[#272727] px-4 py-3">
            <Search className="mr-3 h-4 w-4 shrink-0 text-[#858585]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm font-medium text-[#efefef] placeholder:text-[#4a4a4a] focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#858585]">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className="relative flex w-full cursor-pointer select-none items-start gap-3 rounded-lg py-2.5 pl-9 pr-3 text-sm font-medium text-[#efefef] hover:bg-[#272727] transition-colors duration-150 focus:outline-none text-left"
                >
                  {opt.value === value && (
                    <span className="absolute left-3 top-3">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                  <span className="break-words whitespace-normal">{opt.label}</span>
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
