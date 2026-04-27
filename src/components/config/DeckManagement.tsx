import { useState } from 'react'
import { Plus, Eye, Pencil, Trash2, Layers, RefreshCw } from 'lucide-react'
import type { Constants } from '@/types'
import type { Card, DeckDetail } from '@/types'
import { useDecks } from '@/hooks/useDecks'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card as CardUI, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { DeckModal } from './DeckModal'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog'

interface DeckManagementProps {
  constants: Constants
}

export function DeckManagement({ constants }: DeckManagementProps) {
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
  }

  const handleDelete = async () => {
    if (deleteVersion === null) return
    setDeleting(true)
    await remove(deleteVersion)
    setDeleteVersion(null)
    setDeleting(false)
  }

  return (
    <CardUI>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deck Management</CardTitle>
            <CardDescription className="mt-1">Create, view, and edit card decks stored as version files</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon-sm" onClick={reload} title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              New Deck
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-[hsl(210,15%,55%)]">
            Loading decks…
          </div>
        ) : decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Layers className="h-10 w-10 text-[hsl(210,10%,35%)]" />
            <p className="text-sm text-[hsl(210,15%,55%)]">No custom decks yet</p>
            <Button variant="secondary" size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Create your first deck
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(222,20%,18%)]">
            {decks.map((deck) => (
              <div key={deck.version} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(210,100%,60%)]/10 text-xs font-bold text-[hsl(210,100%,60%)]">
                    v{deck.version}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(210,20%,94%)]">
                      version_{deck.version}.json
                    </p>
                    <p className="text-xs text-[hsl(210,15%,55%)]">
                      {deck.card_count} cards · types: {deck.types.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="muted">{deck.types.join('/')}</Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => openView(deck.version)} title="View">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(deck.version)} title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteVersion(deck.version)}
                    className="text-[hsl(355,75%,60%)] hover:text-[hsl(355,75%,60%)] hover:bg-[hsl(355,75%,60%)]/10"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Deck v{viewDeck?.version}</DialogTitle>
            <DialogDescription>{viewDeck?.card_count} cards · types {viewDeck?.types.join(', ')}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[hsl(210,15%,55%)] border-b border-[hsl(222,20%,18%)]">
                  <th className="pb-2 pr-3 font-medium">#</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Nom</th>
                  <th className="pb-2 pr-3 font-medium">Present Trigger</th>
                  <th className="pb-2 pr-3 font-medium">Present Effect</th>
                  <th className="pb-2 pr-3 font-medium">Echo Trigger</th>
                  <th className="pb-2 font-medium">Echo Effect</th>
                </tr>
              </thead>
              <tbody>
                {viewDeck?.cards.map((c, i) => (
                  <tr key={c.id} className="border-b border-[hsl(222,20%,18%)] last:border-0">
                    <td className="py-2 pr-3 text-[hsl(210,15%,55%)]">{i + 1}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="muted">{c.type}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-[hsl(210,20%,94%)]">{c.nominal}</td>
                    <td className="py-2 pr-3 text-[hsl(210,15%,55%)] max-w-[180px] truncate" title={c.present_trigger}>{c.present_trigger}</td>
                    <td className="py-2 pr-3 text-[hsl(210,15%,55%)] max-w-[180px] truncate" title={c.present_effect}>{c.present_effect}</td>
                    <td className="py-2 pr-3 text-[hsl(210,15%,55%)] max-w-[180px] truncate" title={c.echo_trigger}>{c.echo_trigger}</td>
                    <td className="py-2 text-[hsl(210,15%,55%)] max-w-[180px] truncate" title={c.echo_effect}>{c.echo_effect}</td>
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
