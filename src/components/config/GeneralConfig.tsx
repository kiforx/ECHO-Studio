import { useState, useEffect, useCallback, useRef } from 'react'
import { Info, Save, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Layers } from 'lucide-react'
import type { Card, Config, DeckSummary } from '@/types'
import { fetchSetCount } from '@/api/config'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'
import { Card as CardUI, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Badge } from '@/components/ui/Badge'

function InfoBlock({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-[#272727] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-[#858585] hover:text-[#efefef] hover:bg-[#1a1a1a] transition-all duration-200 cursor-pointer"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        <Info className="h-3.5 w-3.5 shrink-0 text-[#858585]" />
        More info
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-[#858585] space-y-1.5 border-t border-[#272727] pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

const CSV_MODE_INFO = {
  all: {
    label: 'All Sets',
    summary: 'Include every enumerated set in CSV exports.',
    detail: 'Generates the largest possible CSV files. Useful for full data analysis. Warning: for large recipe sizes this can produce very large files.',
    example: 'Recipe 5AB = N sets → all N appear in each CSV.',
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
  decks: DeckSummary[]
  noDeck: boolean
  onSave: (patch: Partial<Config>) => Promise<Config>
  saving: boolean
}

export function GeneralConfig({ config, deckCards, decks, noDeck, onSave, saving }: GeneralConfigProps) {
  const [recipeStr, setRecipeStr] = useState('')
  const [csvMode, setCsvMode] = useState<Config['csv_export_mode']>(config.csv_export_mode)
  const [rangeStart, setRangeStart] = useState(String(config.csv_set_range?.[0] ?? 1))
  const [rangeEnd, setRangeEnd] = useState(String(config.csv_set_range?.[1] ?? 36))
  const [singleIdx, setSingleIdx] = useState(String(config.csv_single_set_index ?? 1))
  const [csvIds, setCsvIds] = useState<number[]>(config.csv_custom_set_ids ?? [])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [setCount, setSetCount] = useState<number | null>(null)
  const [deckSaving, setDeckSaving] = useState(false)

  const setCountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref so the deckCards cleanup effect can read the latest csvIds without being a dependency.
  const csvIdsRef = useRef(csvIds)
  csvIdsRef.current = csvIds

  useEffect(() => {
    const parts = Object.entries(config.recipe).map(([k, v]) => `${v}${k}`)
    setRecipeStr(parts.join(', '))
    setCsvMode(config.csv_export_mode)
    setRangeStart(String(config.csv_set_range?.[0] ?? 1))
    setRangeEnd(String(config.csv_set_range?.[1] ?? 36))
    setSingleIdx(String(config.csv_single_set_index ?? 1))
    setCsvIds(config.csv_custom_set_ids ?? [])
  }, [config])

  // When deckCards changes, drop any csv_custom_set_ids that no longer exist and auto-save.
  // Guard: skip while deckCards is empty (deck still loading).
  useEffect(() => {
    if (deckCards.length === 0) return
    const validIds = new Set(deckCards.map((c) => c.id))
    const current = csvIdsRef.current
    if (!current.some((id) => !validIds.has(id))) return
    const cleaned = current.filter((id) => validIds.has(id))
    setCsvIds(cleaned)
    onSave({ csv_custom_set_ids: cleaned }).catch(() => {})
  }, [deckCards, onSave])

  // Fetch set count whenever recipe or deck version changes (debounced)
  const refreshSetCount = useCallback((recipe: Record<string, number>, deckVersion: number) => {
    if (setCountTimerRef.current) clearTimeout(setCountTimerRef.current)
    setCountTimerRef.current = setTimeout(() => {
      fetchSetCount(recipe, deckVersion)
        .then(setSetCount)
        .catch(() => setSetCount(null))
    }, 400)
  }, [])

  useEffect(() => {
    const parsed = parseRecipe(recipeStr)
    if (parsed && config.deck_version != null) {
      refreshSetCount(parsed, config.deck_version)
    } else {
      setSetCount(null)
    }
  }, [recipeStr, config.deck_version, refreshSetCount])

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
    if (setCount !== null && setCount === 0) return 'Recipe is impossible: no cards match this combination'
    if (csvMode === 'range') {
      const s = parseInt(rangeStart), e = parseInt(rangeEnd)
      if (isNaN(s) || isNaN(e) || s < 1 || e < s)
        return 'Range: start must be ≥ 1 and start must be ≤ end'
      if (setCount !== null && e > setCount)
        return `Range end (${e}) exceeds the total number of sets (${setCount})`
      if (setCount !== null && s > setCount)
        return `Range start (${s}) exceeds the total number of sets (${setCount})`
    }
    if (csvMode === 'single_set_index') {
      const idx = parseInt(singleIdx)
      if (isNaN(idx) || idx < 1) return 'Single index must be ≥ 1'
      if (setCount !== null && idx > setCount)
        return `Index ${idx} does not exist — only ${setCount} set${setCount === 1 ? '' : 's'} available`
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

  const handleDeckSwitch = async (version: string) => {
    setDeckSaving(true)
    try {
      await onSave({ deck_version: parseInt(version) })
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Failed to switch deck')
    } finally {
      setDeckSaving(false)
    }
  }

  const modeInfo = CSV_MODE_INFO[csvMode]

  return (
    <CardUI>
      <CardHeader>
        <CardTitle>General Configuration</CardTitle>
        <CardDescription>Active deck, recipe, and CSV export filtering</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ── Active Deck Selector ── */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Label>Active Deck</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Select which deck version is used for analysis. Create decks in the Deck Management section below.
              </TooltipContent>
            </Tooltip>
          </div>

          {decks.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#272727] bg-[#1a1a1a] px-4 py-3">
              <Layers className="h-4 w-4 text-[#4a4a4a] shrink-0" />
              <p className="text-sm text-[#858585]">No decks found. Please create a deck first.</p>
            </div>
          ) : (
            <Select
              value={String(config.deck_version)}
              onValueChange={handleDeckSwitch}
              disabled={deckSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deck…" />
              </SelectTrigger>
              <SelectContent>
                {decks.map((d) => (
                  <SelectItem key={d.version} value={String(d.version)}>
                    version_{d.version}.json — {d.card_count} cards ({d.types.join('/')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {decks.length > 0 && (
            <p className="text-sm text-[#4a4a4a]">
              Active: version_{config.deck_version}.json
            </p>
          )}
        </div>

        {/* ── Recipe ── */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="recipe">Recipe</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
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
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-[#4a4a4a]">
              Active: {Object.entries(config.recipe).map(([k, v]) => `${v} cards from "${k}"`).join(' + ')}
            </p>
            {setCount !== null && (
              <Badge variant="muted">{setCount.toLocaleString()} sets</Badge>
            )}
          </div>
          {setCount !== null && setCount === 0 && parseRecipe(recipeStr) && (
            <p className="text-sm text-[hsl(355,75%,60%)]">
              This recipe produces 0 sets — check card type availability in the active deck.
            </p>
          )}
          <InfoBlock>
            <p><strong className="text-[#efefef]">What is a recipe?</strong> A recipe tells the engine how many cards of each type group to draw when forming sets.</p>
            <p><strong className="text-[#efefef]">Example:</strong> <code className="bg-[#272727] px-1.5 py-0.5 rounded text-xs">5AB</code> → draw exactly 5 cards chosen from all type-A and type-B cards combined.</p>
            <p><strong className="text-[#efefef]">Multiple groups:</strong> <code className="bg-[#272727] px-1.5 py-0.5 rounded text-xs">3AB, 2C</code> → 3 from A/B <em>and</em> 2 from C (these groups are independent — sets are the cartesian product).</p>
          </InfoBlock>
        </div>

        {/* ── CSV Export Mode ── */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Label>CSV Export Mode</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
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

          <p className="text-sm text-[#858585]">{modeInfo.summary}</p>

          {csvMode === 'range' && (
            <div className="rounded-xl border border-[#272727] bg-[#1a1a1a] p-4 space-y-3">
              <p className="text-sm text-[#858585]">
                Set index range (1-based, inclusive)
                {setCount !== null && <span className="ml-2 text-[#4a4a4a]">· {setCount.toLocaleString()} sets available</span>}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="range-start" className="text-xs">Start index</Label>
                  <Input
                    id="range-start"
                    type="number"
                    min={1}
                    max={setCount ?? undefined}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                  />
                </div>
                <span className="text-[#4a4a4a] mt-6 font-bold">–</span>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="range-end" className="text-xs">End index</Label>
                  <Input
                    id="range-end"
                    type="number"
                    min={1}
                    max={setCount ?? undefined}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                  />
                </div>
              </div>
              {(() => {
                const s = parseInt(rangeStart), e = parseInt(rangeEnd)
                if (!isNaN(s) && !isNaN(e) && s > e)
                  return <p className="text-sm text-[hsl(355,75%,60%)]">Start must be ≤ end</p>
                if (setCount !== null && !isNaN(e) && e > setCount)
                  return <p className="text-sm text-[hsl(355,75%,60%)]">End ({e}) exceeds max sets ({setCount})</p>
                return null
              })()}
            </div>
          )}

          {csvMode === 'single_set_index' && (
            <div className="rounded-xl border border-[#272727] bg-[#1a1a1a] p-4 space-y-2.5">
              <Label htmlFor="single-idx" className="text-xs">
                Set index (1-based{setCount !== null ? `, max ${setCount.toLocaleString()}` : ''})
              </Label>
              <Input
                id="single-idx"
                type="number"
                min={1}
                max={setCount ?? undefined}
                value={singleIdx}
                onChange={(e) => setSingleIdx(e.target.value)}
              />
              {setCount !== null && parseInt(singleIdx) > setCount && (
                <p className="text-sm text-[hsl(355,75%,60%)]">
                  Index {singleIdx} does not exist — only {setCount.toLocaleString()} sets available
                </p>
              )}
              {!(setCount !== null && parseInt(singleIdx) > setCount) && (
                <p className="text-sm text-[#4a4a4a]">
                  Exports exactly set #{singleIdx || '?'} from the enumeration order.
                </p>
              )}
            </div>
          )}

          {csvMode === 'custom_set_ids' && (
            <div className={`rounded-xl border border-[#272727] bg-[#1a1a1a] p-4 space-y-3 ${noDeck ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#858585]">
                  {noDeck ? 'No active deck — create a deck first' : 'Select card IDs forming the set to export'}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    These IDs identify a specific card set in the enumeration. The set whose sorted
                    card IDs match your selection will be included in the CSVs.
                    This is independent of the Single-Set Analysis IDs.
                  </TooltipContent>
                </Tooltip>
              </div>
              {csvIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {csvIds.map((id) => (
                    <Badge key={id} variant={validDeckIds.has(id) ? 'default' : 'danger'}>
                      {id}
                    </Badge>
                  ))}
                </div>
              )}
              {deckCards.length === 0 ? (
                <p className="text-sm text-[#4a4a4a]">No deck cards loaded.</p>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {deckCards.map((card) => {
                    const active = csvIds.includes(card.id)
                    const invalid = active && !validDeckIds.has(card.id)
                    return (
                      <button
                        key={card.id}
                        onClick={() => toggleCsvId(card.id)}
                        title={`ID ${card.id} · ${card.type}${card.nominal}`}
                        className={`flex flex-col items-center rounded-lg border px-2 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          invalid
                            ? 'border-[hsl(355,75%,60%)] bg-[hsl(355,75%,60%)]/10 text-[hsl(355,75%,60%)]'
                            : active
                            ? 'border-white bg-white/10 text-white'
                            : 'border-[#272727] text-[#858585] hover:border-[#383838] hover:text-[#efefef]'
                        }`}
                      >
                        <span className="font-bold">{card.id}</span>
                        <span className="opacity-60 text-[10px] mt-0.5">{card.type}{card.nominal}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <InfoBlock>
            <p><strong className="text-[#efefef]">{modeInfo.label}:</strong> {modeInfo.detail}</p>
            <p><strong className="text-[#efefef]">Example:</strong> {modeInfo.example}</p>
            <p className="mt-1 text-[#4a4a4a]">
              ⚠ This setting only affects CSV detail exports, not the TXT reports or which analysis is performed.
            </p>
          </InfoBlock>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 text-sm text-[hsl(355,75%,60%)]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving || (noDeck && csvMode === 'custom_set_ids')}
          size="sm"
          title={noDeck && csvMode === 'custom_set_ids' ? 'Create a deck first' : undefined}
        >
          {success ? (
            <><CheckCircle className="h-4 w-4" /> Saved</>
          ) : saving ? 'Saving…' : (
            <><Save className="h-4 w-4" /> Save</>
          )}
        </Button>
      </CardContent>
    </CardUI>
  )
}
