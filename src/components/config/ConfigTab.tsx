import { AlertCircle, Layers } from 'lucide-react'
import type { Card, Config, DeckSummary } from '@/types'
import { useConstants } from '@/hooks/useConstants'
import { GeneralConfig } from './GeneralConfig'
import { SimulationConfig } from './SimulationConfig'
import { CustomSetIds } from './CustomSetIds'
import { DeckManagement } from './DeckManagement'
import { Separator } from '@/components/ui/Separator'

interface ConfigTabProps {
  config: Config
  save: (patch: Partial<Config>) => Promise<Config>
  saving: boolean
  decks: DeckSummary[]
  deckCards: Card[]
  noDeck: boolean
  onDecksChanged: () => void
}

export function ConfigTab({
  config,
  save,
  saving,
  decks,
  deckCards,
  noDeck,
  onDecksChanged,
}: ConfigTabProps) {
  const { constants } = useConstants()

  return (
    <div className="space-y-6">
      {noDeck && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-5 py-4 text-sm text-amber-400">
          <Layers className="h-5 w-5 shrink-0" />
          <span>
            <strong>Create a deck first</strong> before configuring analysis.
            Use the Deck Management section below to add a deck.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeneralConfig
          config={config}
          deckCards={deckCards}
          decks={decks}
          noDeck={noDeck}
          onSave={save}
          saving={saving}
        />
        <SimulationConfig config={config} onSave={save} saving={saving} />
      </div>

      <CustomSetIds
        config={config}
        deckCards={deckCards}
        noDeck={noDeck}
        onSave={save}
        saving={saving}
      />

      <Separator />

      {constants ? (
        <DeckManagement constants={constants} onChanged={onDecksChanged} />
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-[hsl(355,75%,60%)]/30 bg-[hsl(355,75%,60%)]/8 px-5 py-4 text-sm text-[hsl(355,75%,60%)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Failed to load constants. Make sure the engine is running.
        </div>
      )}
    </div>
  )
}
