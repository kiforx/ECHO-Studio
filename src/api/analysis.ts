import { api } from './client'
import type { Config, JobSummary } from '@/types'

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
  return new EventSource(`http://localhost:8000/api/v1/analysis/${jobId}/events`)
}

export function buildDownloadUrl(jobId: string, filename: string): string {
  return `http://localhost:8000/api/v1/analysis/${jobId}/download/${filename}`
}
