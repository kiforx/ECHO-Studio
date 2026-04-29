import { useState } from 'react'
import { Plus, Eye, Pencil, Trash2, Layers, RefreshCw } from 'lucide-react'
import type { Constants } from '@/types'
import type { Card, DeckDetail } from '@/types'
import { useDecks } from '@/hooks/useDecks'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card as CardUI, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { DeckModal } from './DeckModal'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog'

interface DeckManagementProps {
  constants: Constants
  onChanged?: () => void
}

function TruncatedCell({ text }: { text: string }) {
  if (!text) return <span className="text-[#4a4a4a] italic text-xs">—</span>
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span className="block max-w-[200px] truncate text-[#858585] text-xs cursor-default">
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="break-words whitespace-normal leading-relaxed text-sm">{text}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function DeckManagement({ constants, onChanged }: DeckManagementProps) {
  const { decks, loading, reload, getDeck, create, update, remove } = useDecks()
  const [modalOpen, setModalOpen] = useState(false)
  const [viewDeck, setViewDeck] = useState<DeckDetail | null>(null)
  const [editDeck, setEditDeck] = useState<DeckDetail | null>(null)
  const [deleteVersion, setDeleteVersion] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = () => {
    setEditDeck(null)
    setModalOpen(true)
  }

  const openEdit = async (version: number) => {
    const deck = await getDeck(version)
    setEditDeck(deck)
    setModalOpen(true)
  }

  const openView = async (version: number) => {
    const deck = await getDeck(version)
    setViewDeck(deck)
  }

  const handleSave = async (version: number, cards: Card[]) => {
    if (editDeck) {
      await update(version, cards)
    } else {
      await create(version, cards)
    }
    onChanged?.()
  }

  const handleDelete = async () => {
    if (deleteVersion === null) return
    setDeleting(true)
    await remove(deleteVersion)
    setDeleteVersion(null)
    setDeleting(false)
    onChanged?.()
  }

  return (
    <CardUI>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deck Management</CardTitle>
            <CardDescription className="mt-1.5">Create, view, and edit card decks stored as version files</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon-sm" onClick={reload} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New Deck
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#858585]">
            Loading decks…
          </div>
        ) : decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Layers className="h-12 w-12 text-[#4a4a4a]" />
            <p className="text-sm text-[#858585]">No custom decks yet</p>
            <Button variant="secondary" size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create your first deck
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#272727]">
            {decks.map((deck) => (
              <div key={deck.version} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-sm font-bold text-white border border-white/10">
                    v{deck.version}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#efefef]">
                      version_{deck.version}.json
                    </p>
                    <p className="text-xs text-[#858585] mt-0.5">
                      {deck.card_count} cards · types: {deck.types.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="muted">{deck.types.join('/')}</Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => openView(deck.version)} title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(deck.version)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteVersion(deck.version)}
                    className="text-[hsl(355,75%,60%)] hover:text-[hsl(355,75%,60%)] hover:bg-[hsl(355,75%,60%)]/10"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create / Edit modal */}
      <DeckModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditDeck(null) }}
        onSave={handleSave}
        constants={constants}
        existingDeck={editDeck}
        existingVersions={decks.map((d) => d.version)}
        availableDecks={decks}
      />

      {/* View modal */}
      <Dialog open={!!viewDeck} onOpenChange={(o) => !o && setViewDeck(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Deck v{viewDeck?.version}</DialogTitle>
            <DialogDescription>{viewDeck?.card_count} cards · types {viewDeck?.types.join(', ')}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[36px]" />
                <col className="w-[64px]" />
                <col className="w-[56px]" />
                <col className="w-[22%]" />
                <col className="w-[22%]" />
                <col className="w-[22%]" />
                <col />
              </colgroup>
              <thead>
                <tr className="text-left border-b border-[#272727]">
                  <th className="pb-3 pr-3 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">#</th>
                  <th className="pb-3 pr-3 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">Type</th>
                  <th className="pb-3 pr-3 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">Nom</th>
                  <th className="pb-3 pr-3 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">Present Trigger</th>
                  <th className="pb-3 pr-3 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">Present Effect</th>
                  <th className="pb-3 pr-3 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">Echo Trigger</th>
                  <th className="pb-3 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">Echo Effect</th>
                </tr>
              </thead>
              <tbody>
                {viewDeck?.cards.map((c, i) => (
                  <tr key={c.id} className="border-b border-[#272727]/60 last:border-0 hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="py-3 pr-3 text-sm font-bold text-[#4a4a4a] font-mono">{i + 1}</td>
                    <td className="py-3 pr-3">
                      <Badge variant="muted">{c.type}</Badge>
                    </td>
                    <td className="py-3 pr-3 text-sm font-semibold text-[#efefef]">{c.nominal}</td>
                    <td className="py-3 pr-3"><TruncatedCell text={c.present_trigger} /></td>
                    <td className="py-3 pr-3"><TruncatedCell text={c.present_effect} /></td>
                    <td className="py-3 pr-3"><TruncatedCell text={c.echo_trigger} /></td>
                    <td className="py-3"><TruncatedCell text={c.echo_effect} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteVersion !== null} onOpenChange={(o) => !o && setDeleteVersion(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Deck v{deleteVersion}?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>version_{deleteVersion}.json</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteVersion(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardUI>
  )
}
