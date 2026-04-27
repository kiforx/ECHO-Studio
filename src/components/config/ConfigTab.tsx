import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import type { Card } from '@/types'
import { useConfig } from '@/hooks/useConfig'
import { useConstants } from '@/hooks/useConstants'
import { api } from '@/api/client'
import { GeneralConfig } from './GeneralConfig'
import { SimulationConfig } from './SimulationConfig'
import { CustomSetIds } from './CustomSetIds'
import { DeckManagement } from './DeckManagement'
import { Separator } from '@/components/ui/Separator'

async function loadDeckCards(deckVersion: number): Promise<Card[]> {
  try {
    const { data } = await api.get(`/decks/${deckVersion}`)
    return data.cards
  } catch {
    // If custom deck not found, load the default cards
    try {
      const { data } = await api.get('/constants/cards')
      return data
    } catch {
      return []
    }
  }
}

export function ConfigTab() {
  const { config, loading: configLoading, saving, error: configError, save } = useConfig()
  const { constants, loading: constsLoading } = useConstants()
  const [deckCards, setDeckCards] = useState<Card[]>([])

  useEffect(() => {
    if (!config) return
    loadDeckCards(config.deck_version).then(setDeckCards)
  }, [config?.deck_version, config?.cards_file])

  if (configLoading || constsLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[hsl(210,15%,55%)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading configuration…</span>
      </div>
    )
  }

  if (!config || !constants) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[hsl(355,75%,60%)]/30 bg-[hsl(355,75%,60%)]/10 px-5 py-4 text-sm text-[hsl(355,75%,60%)]">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {configError ?? 'Failed to load configuration. Make sure the backend is running.'}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GeneralConfig config={config} deckCards={deckCards} onSave={save} saving={saving} />
        <SimulationConfig config={config} onSave={save} saving={saving} />
      </div>
      <CustomSetIds config={config} deckCards={deckCards} onSave={save} saving={saving} />
      <Separator />
      <DeckManagement constants={constants} />
    </div>
  )
}
