import { api } from './client'
import { getClientId } from '@/lib/client-id'
import type { Config, JobSummary } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export async function runAnalysis(payload: {
  selected_reports: string[]
  config?: Partial<Config>
}): Promise<{ job_id: string }> {
  const { data } = await api.post('/analysis/run', payload)
  return data
}

export async function fetchCurrentJob(): Promise<{ job: JobSummary | null }> {
  const { data } = await api.get('/analysis/current')
  return data
}

export async function fetchJobStatus(jobId: string): Promise<JobSummary> {
  const { data } = await api.get(`/analysis/${jobId}`)
  return data
}

export async function cancelJob(jobId: string): Promise<void> {
  await api.post(`/analysis/${jobId}/cancel`)
}

export function openEventStream(jobId: string): EventSource {
  // EventSource cannot send custom headers; job_id IS the client_id so path-based routing works
  return new EventSource(`${API_BASE}/analysis/${jobId}/events`)
}

export function buildDownloadUrl(jobId: string, filename: string): string {
  return `${API_BASE}/analysis/${jobId}/download/${filename}`
}

export function buildDownloadZipUrl(jobId: string, keys?: string[]): string {
  const params = keys && keys.length > 0 ? `?keys=${keys.join(',')}` : ''
  return `${API_BASE}/analysis/${jobId}/download-zip${params}`
}

/** Returns the stable job_id for the current client (= clientId). */
export function getLocalJobId(): string {
  return getClientId()
}
