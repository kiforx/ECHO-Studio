import { useState, useEffect } from 'react'
import { Info, Save, AlertCircle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'
import type { Card, Config } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'
import { Card as CardUI, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Badge } from '@/components/ui/Badge'

// ── Info block ─────────────────────────────────────────────────────────────
function InfoBlock({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-[hsl(222,20%,18%)] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[hsl(210,15%,55%)] hover:text-[hsl(210,20%,94%)] hover:bg-[hsl(222,35%,11%)] transition-colors cursor-pointer"
      >
        {open ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
        <Info className="h-3 w-3 shrink-0 text-[hsl(210,100%,60%)]" />
        More info
      </button>
      {open && (
        <div className="px-3 pb-3 text-xs text-[hsl(210,15%,55%)] space-y-1 border-t border-[hsl(222,20%,18%)] pt-2">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Mode descriptions ──────────────────────────────────────────────────────
const CSV_MODE_INFO = {
  all: {
    label: 'All Sets',
    summary: 'Include every enumerated set in CSV exports.',
    detail: 'Generates the largest possible CSV files. Useful for full data analysis. Warning: for large recipe sizes this can produce very large files.',
    example: 'Recipe 5AB = 36 sets → all 36 appear in each CSV.',
  },
  range: {
    label: 'Set Index Range',
    summary: 'Include only sets whose 1-based index falls within [start, end].',
    detail: 'Sets are indexed in enumeration order (same order as the base report). Useful for exporting a meaningful subset when the full set is too large.',
    example: 'Range [1, 10] → only sets #1 through #10 are written to CSVs.',
  },
  single_set_index: {
    label: 'Single Set Index',
    summary: 'Include exactly one set identified by its 1-based index.',
    detail: 'Useful for debugging or deep-diving a specific set. The index matches the order in the base report.',
    example: 'Index 5 → only the 5th enumerated set appears in CSVs.',
  },
  custom_set_ids: {
    label: 'Custom Card IDs',
    summary: 'Include the one set formed by the specific card IDs you choose below.',
    detail: 'The IDs are matched against enumerated sets. The set whose sorted card IDs match your selection will be exported. Note: this is different from the Single-Set Analysis IDs — it filters CSV output, not the deep-analysis target.',
    example: 'IDs [1, 3, 7, 8, 9] → only that exact set combination appears in CSVs.',
  },
}

interface GeneralConfigProps {
  config: Config
  deckCards: Card[]
  onSave: (patch: Partial<Config>) => Promise<Config>
  saving: boolean
}

export function GeneralConfig({ config, deckCards, onSave, saving }: GeneralConfigProps) {
  const [recipeStr, setRecipeStr] = useState('')
  const [csvMode, setCsvMode] = useState<Config['csv_export_mode']>(config.csv_export_mode)
  const [rangeStart, setRangeStart] = useState(String(config.csv_set_range?.[0] ?? 1))
  const [rangeEnd, setRangeEnd] = useState(String(config.csv_set_range?.[1] ?? 36))
  const [singleIdx, setSingleIdx] = useState(String(config.csv_single_set_index ?? 1))
  const [csvIds, setCsvIds] = useState<number[]>(config.csv_custom_set_ids ?? [])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const parts = Object.entries(config.recipe).map(([k, v]) => `${v}${k}`)
    setRecipeStr(parts.join(', '))
    setCsvMode(config.csv_export_mode)
    setRangeStart(String(config.csv_set_range?.[0] ?? 1))
    setRangeEnd(String(config.csv_set_range?.[1] ?? 36))
    setSingleIdx(String(config.csv_single_set_index ?? 1))
    setCsvIds(config.csv_custom_set_ids ?? [])
  }, [config])

  const parseRecipe = (raw: string): Record<string, number> | null => {
    const result: Record<string, number> = {}
    const parts = raw.split(/[,\s]+/).filter(Boolean)
    for (const part of parts) {
      const m = part.match(/^(\d+)([A-Z]+)$/i)
      if (!m) return null
      result[m[2].toUpperCase()] = parseInt(m[1])
    }
    return Object.keys(result).length > 0 ? result : null
  }

  const validDeckIds = new Set(deckCards.map((c) => c.id))

  const toggleCsvId = (id: number) =>
    setCsvIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const validate = (): string | null => {
    if (!parseRecipe(recipeStr)) return 'Invalid recipe format. Use e.g. "5AB" or "3A, 2B"'
    if (csvMode === 'range') {
      const s = parseInt(rangeStart), e = parseInt(rangeEnd)
      if (isNaN(s) || isNaN(e) || s < 1 || e < s)
        return 'Range: start must be ≥ 1 and start must be ≤ end'
    }
    if (csvMode === 'single_set_index') {
      const idx = parseInt(singleIdx)
      if (isNaN(idx) || idx < 1) return 'Single index must be ≥ 1'
    }
    if (csvMode === 'custom_set_ids' && csvIds.length === 0)
      return 'Select at least one card ID for CSV export'
    if (csvMode === 'custom_set_ids' && csvIds.some((id) => !validDeckIds.has(id)))
      return 'Some selected IDs are not in the current deck'
    return null
  }

  const handleSave = async () => {
    setError(null)
    const err = validate()
    if (err) { setError(err); return }

    const patch: Partial<Config> = {
      recipe: parseRecipe(recipeStr)!,
      csv_export_mode: csvMode,
      csv_set_range: [parseInt(rangeStart), parseInt(rangeEnd)],
      csv_single_set_index: parseInt(singleIdx),
      csv_custom_set_ids: csvIds,
    }
    try {
      await onSave(patch)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Failed to save')
    }
  }

  const modeInfo = CSV_MODE_INFO[csvMode]

  return (
    <CardUI>
      <CardHeader>
        <CardTitle>General Configuration</CardTitle>
        <CardDescription>Recipe and CSV export filtering</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* ── Recipe ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="recipe">Recipe</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-[hsl(210,10%,35%)] cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Defines how many cards of each type group are drawn per set.
                Format: "5AB" = 5 cards from types A or B.
                Multiple groups: "3AB, 2C".
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="recipe"
            value={recipeStr}
            onChange={(e) => setRecipeStr(e.target.value)}
            placeholder="e.g. 5AB"
          />
          <p className="text-xs text-[hsl(210,10%,35%)]">
            Active: {Object.entries(config.recipe).map(([k, v]) => `${v} cards from "${k}"`).join(' + ')}
          </p>
          <InfoBlock>
            <p><strong>What is a recipe?</strong> A recipe tells the engine how many cards of each type group to draw when forming sets.</p>
            <p><strong>Example:</strong> <code>5AB</code> → draw exactly 5 cards chosen from all type-A and type-B cards combined.</p>
            <p><strong>Multiple groups:</strong> <code>3AB, 2C</code> → 3 from A/B <em>and</em> 2 from C (these groups are independent — sets are the cartesian product).</p>
            <p><strong>Set count:</strong> depends on how many cards of each type exist in the active deck. More cards = exponentially more sets.</p>
          </InfoBlock>
        </div>

        {/* ── CSV Export Mode ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label>CSV Export Mode</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-[hsl(210,10%,35%)] cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-72">
                {modeInfo.summary}
              </TooltipContent>
            </Tooltip>
          </div>

          <Select value={csvMode} onValueChange={(v) => setCsvMode(v as Config['csv_export_mode'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CSV_MODE_INFO) as Array<Config['csv_export_mode']>).map((k) => (
                <SelectItem key={k} value={k}>{CSV_MODE_INFO[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-xs text-[hsl(210,15%,55%)]">{modeInfo.summary}</p>

          {/* Dynamic sub-fields */}
          {csvMode === 'range' && (
            <div className="rounded-lg border border-[hsl(222,20%,18%)] bg-[hsl(222,35%,11%)] p-3 space-y-3">
              <p className="text-xs text-[hsl(210,15%,55%)]">Set index range (1-based, inclusive)</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="range-start" className="text-[10px]">Start index</Label>
                  <Input
                    id="range-start"
                    type="number"
                    min={1}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                  />
                </div>
                <span className="text-[hsl(210,10%,35%)] mt-5">–</span>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="range-end" className="text-[10px]">End index</Label>
                  <Input
                    id="range-end"
                    type="number"
                    min={1}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                  />
                </div>
              </div>
              {parseInt(rangeStart) > parseInt(rangeEnd) && (
                <p className="text-xs text-[hsl(355,75%,60%)]">Start must be ≤ end</p>
              )}
            </div>
          )}

          {csvMode === 'single_set_index' && (
            <div className="rounded-lg border border-[hsl(222,20%,18%)] bg-[hsl(222,35%,11%)] p-3 space-y-2">
              <Label htmlFor="single-idx" className="text-[10px]">Set index (1-based)</Label>
              <Input
                id="single-idx"
                type="number"
                min={1}
                value={singleIdx}
                onChange={(e) => setSingleIdx(e.target.value)}
              />
              <p className="text-xs text-[hsl(210,10%,35%)]">
                Exports exactly set #{singleIdx || '?'} from the enumeration order.
              </p>
            </div>
          )}

          {csvMode === 'custom_set_ids' && (
            <div className="rounded-lg border border-[hsl(222,20%,18%)] bg-[hsl(222,35%,11%)] p-3 space-y-3">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-[hsl(210,15%,55%)]">
                  Select card IDs forming the set to export
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-[hsl(210,10%,35%)] cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    These IDs identify a specific card set in the enumeration. The set whose sorted
                    card IDs match your selection will be included in the CSVs.
                    This is independent of the Single-Set Analysis IDs.
                  </TooltipContent>
                </Tooltip>
              </div>
              {csvIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {csvIds.map((id) => (
                    <Badge key={id} variant={validDeckIds.has(id) ? 'default' : 'danger'}>
                      {id}
                    </Badge>
                  ))}
                </div>
              )}
              {deckCards.length === 0 ? (
                <p className="text-xs text-[hsl(210,10%,35%)]">No deck cards loaded.</p>
              ) : (
                <div className="grid grid-cols-6 gap-1.5">
                  {deckCards.map((card) => {
                    const active = csvIds.includes(card.id)
                    const invalid = active && !validDeckIds.has(card.id)
                    return (
                      <button
                        key={card.id}
                        onClick={() => toggleCsvId(card.id)}
                        title={`ID ${card.id} · ${card.type}${card.nominal}`}
                        className={`flex flex-col items-center rounded border px-1.5 py-1.5 text-[10px] transition-all cursor-pointer ${
                          invalid
                            ? 'border-[hsl(355,75%,60%)] bg-[hsl(355,75%,60%)]/10 text-[hsl(355,75%,60%)]'
                            : active
                            ? 'border-[hsl(210,100%,60%)] bg-[hsl(210,100%,60%)]/10 text-[hsl(210,100%,60%)]'
                            : 'border-[hsl(222,20%,18%)] text-[hsl(210,15%,55%)] hover:border-[hsl(222,20%,26%)]'
                        }`}
                      >
                        <span className="font-bold">{card.id}</span>
                        <span className="opacity-60">{card.type}{card.nominal}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <InfoBlock>
            <p><strong>{modeInfo.label}:</strong> {modeInfo.detail}</p>
            <p><strong>Example:</strong> {modeInfo.example}</p>
            <p className="mt-1 text-[hsl(210,10%,35%)]">
              ⚠ This setting only affects CSV detail exports, not the TXT reports or which analysis is performed.
            </p>
          </InfoBlock>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-[hsl(355,75%,60%)]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} size="sm">
          {success ? (
            <><CheckCircle className="h-3.5 w-3.5" /> Saved</>
          ) : saving ? 'Saving…' : (
            <><Save className="h-3.5 w-3.5" /> Save</>
          )}
        </Button>
      </CardContent>
    </CardUI>
  )
}
