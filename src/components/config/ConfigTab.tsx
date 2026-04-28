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
      <div className="flex items-center justify-center py-32 gap-3 text-[#858585]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading configuration…</span>
      </div>
    )
  }

  if (!config || !constants) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[hsl(355,75%,60%)]/30 bg-[hsl(355,75%,60%)]/8 px-5 py-4 text-sm text-[hsl(355,75%,60%)]">
        <AlertCircle className="h-5 w-5 shrink-0" />
        {configError ?? 'Failed to load configuration. Make sure the backend is running.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeneralConfig config={config} deckCards={deckCards} onSave={save} saving={saving} />
        <SimulationConfig config={config} onSave={save} saving={saving} />
      </div>
      <CustomSetIds config={config} deckCards={deckCards} onSave={save} saving={saving} />
      <Separator />
      <DeckManagement constants={constants} />
    </div>
  )
}
