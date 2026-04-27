import { api } from './client'
import type { Card, DeckDetail, DeckSummary } from '@/types'

export async function fetchDecks(): Promise<DeckSummary[]> {
  const { data } = await api.get('/decks')
  return data
}

export async function fetchDeck(version: number): Promise<DeckDetail> {
  const { data } = await api.get(`/decks/${version}`)
  return data
}

export async function createDeck(payload: { version: number; cards: Card[] }): Promise<DeckDetail> {
  const { data } = await api.post('/decks', payload)
  return data
}

export async function updateDeck(version: number, cards: Card[]): Promise<DeckDetail> {
  const { data } = await api.put(`/decks/${version}`, { cards })
  return data
}

export async function deleteDeck(version: number): Promise<void> {
  await api.delete(`/decks/${version}`)
}
