import { api } from './client'
import type { Constants } from '@/types'

export async function fetchConstants(): Promise<Constants> {
  const { data } = await api.get('/constants')
  return data
}
