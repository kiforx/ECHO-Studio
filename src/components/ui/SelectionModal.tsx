import { useState } from 'react'
import { Search, Check, ChevronDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { cn } from '@/lib/utils'

interface SelectionModalOption {
  value: string
  label: string
}

interface SelectionModalProps {
  options: SelectionModalOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  title?: string
  disabled?: boolean
  className?: string
}

export function SelectionModal({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  title = 'Select an option',
  disabled,
  className,
}: SelectionModalProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((o) => o.value === value)
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    setSearch('')
  }

  return (
    <>
      <button
        disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-[#272727] bg-[#111111] px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent hover:border-[#383838] hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
          selected ? 'text-[#efefef]' : 'text-[#4a4a4a]',
          className
        )}
      >
        <span className="truncate text-left">{selected?.label ?? placeholder}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#858585]" />
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch('') }}>
        <DialogContent className="max-w-lg flex flex-col" style={{ maxHeight: '70vh', padding: 0 }}>
          <DialogHeader className="px-6 py-5 shrink-0">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center border-b border-[#272727] px-5 py-3 shrink-0">
            <Search className="mr-3 h-4 w-4 shrink-0 text-[#858585]" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm font-medium text-[#efefef] placeholder:text-[#4a4a4a] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setOpen(false); setSearch('') }
                if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0].value)
              }}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#858585]">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-left transition-all duration-150 cursor-pointer',
                    opt.value === value
                      ? 'bg-white/10 text-white'
                      : 'text-[#efefef] hover:bg-[#1a1a1a]'
                  )}
                >
                  <div className="w-5 shrink-0 mt-0.5">
                    {opt.value === value && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <span className="break-words whitespace-normal leading-relaxed">{opt.label}</span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
