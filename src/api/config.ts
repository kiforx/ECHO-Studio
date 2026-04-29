import { api } from './client'
import type { Config } from '@/types'

export async function fetchConfig(): Promise<Config> {
  const { data } = await api.get('/config')
  return data
}

export async function updateConfig(patch: Partial<Config>): Promise<Config> {
  const { data } = await api.put('/config', patch)
  return data
}

export async function fetchSetCount(
  recipe: Record<string, number>,
  deckVersion: number,
): Promise<number> {
  const { data } = await api.post('/config/set_count', { recipe, deck_version: deckVersion })
  return data.set_count as number
}
