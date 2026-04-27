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
