import { useState, useEffect } from 'react'
import { Info, Save, CheckCircle, AlertCircle, X } from 'lucide-react'
import type { Card, Config } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card as CardUI, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'

interface CustomSetIdsProps {
  config: Config
  deckCards: Card[]
  onSave: (patch: Partial<Config>) => Promise<Config>
  saving: boolean
}

function CardPreviewTooltip({ card }: { card: Card }) {
  return (
    <div className="w-72 p-0">
      <div className="px-4 pt-3 pb-2 border-b border-[#272727]">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white">#{card.id}</span>
          <span className="text-xs text-[#858585] bg-[#272727] rounded-md px-2 py-0.5">
            Type {card.type} · Nominal {card.nominal}
          </span>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {[
          { label: 'Present Trigger', value: card.present_trigger },
          { label: 'Present Effect', value: card.present_effect },
          { label: 'Echo Trigger', value: card.echo_trigger },
          { label: 'Echo Effect', value: card.echo_effect },
        ].map(({ label, value }) => (
          <div key={label}>
            <span className="text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider">{label}</span>
            <p className="text-sm text-[#efefef] mt-0.5 break-words leading-relaxed">
              {value || <span className="text-[#4a4a4a] italic">—</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CustomSetIds({ config, deckCards, onSave, saving }: CustomSetIdsProps) {
  const [selected, setSelected] = useState<number[]>(config.custom_set_ids)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setSelected(config.custom_set_ids)
    setError(null)
  }, [config.custom_set_ids])

  const validIds = new Set(deckCards.map((c) => c.id))
  const hasInvalid = selected.some((id) => !validIds.has(id))

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setError(null)
  }

  const remove = (id: number) => setSelected((prev) => prev.filter((x) => x !== id))

  const handleSave = async () => {
    setError(null)
    if (selected.length === 0) {
      setError('Select at least one card ID')
      return
    }
    const bad = selected.filter((id) => !validIds.has(id))
    if (bad.length > 0) {
      setError(`IDs not in current deck: ${bad.join(', ')}`)
      return
    }
    try {
      await onSave({ custom_set_ids: selected })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to save')
    }
  }

  const cardById = Object.fromEntries(deckCards.map((c) => [c.id, c]))

  return (
    <CardUI>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Custom Set IDs</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-[#4a4a4a] cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              Card IDs used for the single-set deep analysis. Must all exist in the currently
              active deck. The order determines the starting permutation.
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Select cards from the active deck for single-set analysis · hover a card to preview its details
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const card = cardById[id]
              const isInvalid = !validIds.has(id)
              return (
                <button
                  key={id}
                  onClick={() => remove(id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                    isInvalid
                      ? 'bg-[hsl(355,75%,60%)]/15 text-[hsl(355,75%,60%)] border border-[hsl(355,75%,60%)]/30 hover:bg-[hsl(355,75%,60%)]/25'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {isInvalid ? `!${id}` : `${id}${card ? ` · ${card.type}${card.nominal}` : ''}`}
                  <X className="h-3.5 w-3.5" />
                </button>
              )
            })}
          </div>
        )}

        {/* Card grid picker with hover previews */}
        {deckCards.length === 0 ? (
          <p className="text-sm text-[#858585]">No cards in active deck.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-10">
            {deckCards.map((card) => {
              const active = selected.includes(card.id)
              return (
                <Tooltip key={card.id} delayDuration={250}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggle(card.id)}
                      className={`flex flex-col items-center rounded-xl border px-2 py-3 text-sm transition-all duration-200 cursor-pointer ${
                        active
                          ? 'border-white bg-white/10 text-white shadow-sm shadow-white/10'
                          : 'border-[#272727] bg-[#1a1a1a] text-[#858585] hover:border-[#383838] hover:text-[#efefef] hover:bg-[#222222]'
                      }`}
                    >
                      <span className="font-bold text-base">{card.id}</span>
                      <span className="text-[11px] mt-0.5 opacity-60 font-medium">{card.type}{card.nominal}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-0 max-w-none border-[#272727]">
                    <CardPreviewTooltip card={card} />
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )}

        {hasInvalid && (
          <div className="flex items-center gap-2 text-sm text-[hsl(355,75%,60%)]">
            <AlertCircle className="h-4 w-4" />
            Some selected IDs are not in the current deck
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-[hsl(355,75%,60%)]">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving || selected.length === 0} size="sm">
          {success ? (
            <><CheckCircle className="h-4 w-4" /> Saved</>
          ) : saving ? (
            'Saving…'
          ) : (
            <><Save className="h-4 w-4" /> Save ({selected.length} IDs)</>
          )}
        </Button>
      </CardContent>
    </CardUI>
  )
}
