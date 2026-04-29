import axios from 'axios'
import { getClientId } from '@/lib/client-id'

export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  config.headers['X-Client-ID'] = getClientId()
  return config
})
