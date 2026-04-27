import { useCallback, useEffect, useState } from 'react'
import { fetchDecks, fetchDeck, createDeck, updateDeck, deleteDeck } from '@/api/decks'
import type { Card, DeckDetail, DeckSummary } from '@/types'

export function useDecks() {
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    fetchDecks()
      .then(setDecks)
      .catch(() => setError('Failed to load decks'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const getDeck = useCallback((version: number) => fetchDeck(version), [])

  const create = useCallback(
    async (version: number, cards: Card[]): Promise<DeckDetail> => {
      const deck = await createDeck({ version, cards })
      reload()
      return deck
    },
    [reload]
  )

  const update = useCallback(
    async (version: number, cards: Card[]): Promise<DeckDetail> => {
      const deck = await updateDeck(version, cards)
      reload()
      return deck
    },
    [reload]
  )

  const remove = useCallback(
    async (version: number) => {
      await deleteDeck(version)
      reload()
    },
    [reload]
  )

  return { decks, loading, error, reload, getDeck, create, update, remove }
}
