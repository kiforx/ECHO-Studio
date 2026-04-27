import { Trash2 } from 'lucide-react'
import type { Card, CardType, Nominal } from '@/types'
import type { Constants } from '@/types'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'

interface CardEditorRowProps {
  card: Card
  index: number
  constants: Constants
  onChange: (updated: Card) => void
  onRemove: () => void
}

export function CardEditorRow({ card, index, constants, onChange, onRemove }: CardEditorRowProps) {
  const triggerOptions = constants.triggers.map((t) => ({ value: t, label: t }))
  const effectOptions = constants.effects.map((e) => ({ value: e, label: e }))

  const set = (patch: Partial<Card>) => onChange({ ...card, ...patch })

  return (
    <div className="grid grid-cols-[40px_80px_72px_1fr_1fr_1fr_1fr_36px] gap-2 items-start py-3 border-b border-[hsl(222,20%,18%)] last:border-0">
      <div className="flex items-center justify-center h-9">
        <span className="text-xs text-[hsl(210,15%,55%)] font-mono">{index + 1}</span>
      </div>

      {/* Type */}
      <Select
        value={card.type}
        onValueChange={(v) => set({ type: v as CardType })}
      >
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['A', 'B', 'C'].map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Nominal */}
      <Select
        value={String(card.nominal)}
        onValueChange={(v) => set({ nominal: Number(v) as Nominal })}
      >
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4].map((n) => (
            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* present_trigger */}
      <Combobox
        options={triggerOptions}
        value={card.present_trigger}
        onChange={(v) => set({ present_trigger: v })}
        placeholder="Present trigger…"
        searchPlaceholder="Search trigger…"
      />

      {/* present_effect */}
      <Combobox
        options={effectOptions}
        value={card.present_effect}
        onChange={(v) => set({ present_effect: v })}
        placeholder="Present effect…"
        searchPlaceholder="Search effect…"
      />

      {/* echo_trigger */}
      <Combobox
        options={triggerOptions}
        value={card.echo_trigger}
        onChange={(v) => set({ echo_trigger: v })}
        placeholder="Echo trigger…"
        searchPlaceholder="Search trigger…"
      />

      {/* echo_effect */}
      <Combobox
        options={effectOptions}
        value={card.echo_effect}
        onChange={(v) => set({ echo_effect: v })}
        placeholder="Echo effect…"
        searchPlaceholder="Search effect…"
      />

      <Button variant="ghost" size="icon-sm" onClick={onRemove} className="text-[hsl(355,75%,60%)] hover:text-[hsl(355,75%,60%)] hover:bg-[hsl(355,75%,60%)]/10">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
