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
        <div className="flex items-center gap-1.5">
          <CardTitle>Custom Set IDs</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-[hsl(210,10%,35%)] cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              Card IDs used for the single-set deep analysis. Must all exist in the currently
              active deck. The order determines the starting permutation.
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>Select cards from the active deck for single-set analysis</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((id) => {
              const card = cardById[id]
              const isInvalid = !validIds.has(id)
              return (
                <button
                  key={id}
                  onClick={() => remove(id)}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    isInvalid
                      ? 'bg-[hsl(355,75%,60%)]/15 text-[hsl(355,75%,60%)] border border-[hsl(355,75%,60%)]/30'
                      : 'bg-[hsl(210,100%,60%)]/15 text-[hsl(210,100%,60%)] border border-[hsl(210,100%,60%)]/30 hover:bg-[hsl(210,100%,60%)]/25'
                  }`}
                >
                  {isInvalid ? `!${id}` : `${id}${card ? ` (${card.type}${card.nominal})` : ''}`}
                  <X className="h-3 w-3" />
                </button>
              )
            })}
          </div>
        )}

        {/* Card grid picker */}
        {deckCards.length === 0 ? (
          <p className="text-sm text-[hsl(210,15%,55%)]">No cards in active deck.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-9">
            {deckCards.map((card) => {
              const active = selected.includes(card.id)
              return (
                <button
                  key={card.id}
                  onClick={() => toggle(card.id)}
                  title={`ID ${card.id} · ${card.type}${card.nominal}\nPresent: ${card.present_trigger}\nEcho: ${card.echo_trigger}`}
                  className={`flex flex-col items-center rounded-lg border px-2 py-2 text-xs transition-all cursor-pointer ${
                    active
                      ? 'border-[hsl(210,100%,60%)] bg-[hsl(210,100%,60%)]/10 text-[hsl(210,100%,60%)]'
                      : 'border-[hsl(222,20%,18%)] bg-[hsl(222,35%,11%)] text-[hsl(210,15%,55%)] hover:border-[hsl(222,20%,26%)] hover:text-[hsl(210,20%,94%)]'
                  }`}
                >
                  <span className="font-bold">{card.id}</span>
                  <span className="text-[10px] mt-0.5 opacity-70">{card.type}{card.nominal}</span>
                </button>
              )
            })}
          </div>
        )}

        {hasInvalid && (
          <div className="flex items-center gap-2 text-xs text-[hsl(355,75%,60%)]">
            <AlertCircle className="h-3.5 w-3.5" />
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
            <><CheckCircle className="h-3.5 w-3.5" /> Saved</>
          ) : saving ? (
            'Saving…'
          ) : (
            <><Save className="h-3.5 w-3.5" /> Save ({selected.length} IDs)</>
          )}
        </Button>
      </CardContent>
    </CardUI>
  )
}
