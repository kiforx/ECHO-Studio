import { useEffect, useState } from 'react'
import { Plus, AlertCircle, Copy, FileStack } from 'lucide-react'
import type { Card, DeckDetail, DeckSummary } from '@/types'
import type { Constants } from '@/types'
import { fetchDeck } from '@/api/decks'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'
import { CardEditorRow } from './CardEditor'

function makeBlankCard(id: number): Card {
  return { id, type: 'A', nominal: 1, present_trigger: '', present_effect: '', echo_trigger: '', echo_effect: '' }
}

type CreateMode = 'empty' | 'clone'

interface DeckModalProps {
  open: boolean
  onClose: () => void
  onSave: (version: number, cards: Card[]) => Promise<void>
  constants: Constants
  existingDeck?: DeckDetail | null
  existingVersions?: number[]
  availableDecks?: DeckSummary[]
}

export function DeckModal({
  open, onClose, onSave, constants, existingDeck,
  existingVersions = [], availableDecks = [],
}: DeckModalProps) {
  const isEdit = !!existingDeck

  const [version, setVersion] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [createMode, setCreateMode] = useState<CreateMode>('empty')
  const [cloneSource, setCloneSource] = useState<string>('')
  const [cloneLoading, setCloneLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (existingDeck) {
      setVersion(String(existingDeck.version))
      setCards(existingDeck.cards)
    } else {
      setVersion('')
      setCards([makeBlankCard(1)])
      setCreateMode('empty')
      setCloneSource('')
    }
    setError(null)
  }, [existingDeck, open])

  const handleCloneSourceChange = async (sourceVersion: string) => {
    setCloneSource(sourceVersion)
    if (!sourceVersion) return
    setCloneLoading(true)
    try {
      const deck = await fetchDeck(parseInt(sourceVersion))
      setCards(deck.cards.map((c) => ({ ...c })))
    } catch {
      setError(`Could not load deck v${sourceVersion}`)
    } finally {
      setCloneLoading(false)
    }
  }

  const addCard = () => {
    const nextId = cards.length > 0 ? Math.max(...cards.map((c) => c.id)) + 1 : 1
    setCards((prev) => [...prev, makeBlankCard(nextId)])
  }

  const updateCard = (index: number, updated: Card) =>
    setCards((prev) => prev.map((c, i) => (i === index ? updated : c)))

  const removeCard = (index: number) =>
    setCards((prev) => prev.filter((_, i) => i !== index))

  const validate = (): string | null => {
    if (!isEdit) {
      const v = parseInt(version)
      if (!version || isNaN(v) || v < 1) return 'Version must be a positive integer'
      if (existingVersions.includes(v)) return `Version ${v} already exists`
      if (createMode === 'clone' && !cloneSource) return 'Select a source deck to clone from'
    }
    if (cards.length === 0) return 'Deck must have at least one card'
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i]
      if (!c.present_trigger) return `Card ${i + 1}: present trigger is required`
      if (!c.present_effect) return `Card ${i + 1}: present effect is required`
      if (!c.echo_trigger) return `Card ${i + 1}: echo trigger is required`
      if (!c.echo_effect) return `Card ${i + 1}: echo effect is required`
    }
    return null
  }

  const handleSave = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(parseInt(version), cards)
      onClose()
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to save deck')
    } finally {
      setSaving(false)
    }
  }

  const clonableDecks = availableDecks

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit Deck v${existingDeck?.version}` : 'Create New Deck'}</DialogTitle>
          <DialogDescription>
            All triggers and effects must be selected from the predefined list — no free text.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Version + create mode (create only) ── */}
          {!isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deck-version">Version number</Label>
                <Input
                  id="deck-version"
                  type="number"
                  min={1}
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 9"
                />
              </div>
              <div className="space-y-2">
                <Label>Starting cards</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCreateMode('empty'); setCards([makeBlankCard(1)]) }}
                    className={`flex-1 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      createMode === 'empty'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-[#272727] text-[#858585] hover:border-[#383838] hover:text-[#efefef]'
                    }`}
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    Empty deck
                  </button>
                  <button
                    onClick={() => setCreateMode('clone')}
                    className={`flex-1 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      createMode === 'clone'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-[#272727] text-[#858585] hover:border-[#383838] hover:text-[#efefef]'
                    }`}
                  >
                    <Copy className="h-4 w-4 shrink-0" />
                    Clone existing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Clone source picker ── */}
          {!isEdit && createMode === 'clone' && (
            <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileStack className="h-4 w-4" />
                Clone from existing deck
              </div>
              <p className="text-sm text-[#858585]">
                Cards are copied and pre-filled below. You can edit them freely before saving — the source deck is unchanged.
              </p>
              {clonableDecks.length === 0 ? (
                <p className="text-sm text-[hsl(355,75%,60%)]">No existing decks to clone from.</p>
              ) : (
                <Select value={cloneSource} onValueChange={handleCloneSourceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source deck…" />
                  </SelectTrigger>
                  <SelectContent>
                    {clonableDecks.map((d) => (
                      <SelectItem key={d.version} value={String(d.version)}>
                        version_{d.version}.json — {d.card_count} cards ({d.types.join('/')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {cloneLoading && (
                <p className="text-sm text-[#858585] animate-pulse">Loading cards…</p>
              )}
            </div>
          )}

          {/* ── Column headers ── */}
          <div className="grid grid-cols-[44px_90px_80px_1fr_1fr_1fr_1fr_40px] gap-2 pb-2 border-b border-[#272727] sticky top-0 bg-[#111111] z-10 pt-1">
            <span className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider text-center">#</span>
            <span className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider pl-1">Type</span>
            <span className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider pl-1">Nominal</span>
            <span className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider pl-1">Present Trigger</span>
            <span className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider pl-1">Present Effect</span>
            <span className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider pl-1">Echo Trigger</span>
            <span className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider pl-1">Echo Effect</span>
            <span />
          </div>

          {/* ── Card rows ── */}
          <div>
            {cards.map((card, idx) => (
              <CardEditorRow
                key={`${card.id}-${idx}`}
                card={card}
                index={idx}
                constants={constants}
                onChange={(updated) => updateCard(idx, updated)}
                onRemove={() => removeCard(idx)}
              />
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={addCard} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Add Card
          </Button>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-[hsl(355,75%,60%)]/30 bg-[hsl(355,75%,60%)]/10 px-5 py-4 text-sm text-[hsl(355,75%,60%)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || cloneLoading}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Deck'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
