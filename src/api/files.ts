import { api } from './client'
import { getClientId } from '@/lib/client-id'
import type { GeneratedFilesResponse } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export async function fetchGeneratedFiles(): Promise<GeneratedFilesResponse> {
  const { data } = await api.get('/files')
  return data
}

export async function deleteGeneratedFile(filename: string): Promise<void> {
  await api.delete(`/files/${encodeURIComponent(filename)}`)
}

// job_id IS the client_id; a plain <a href download> cannot carry the
// X-Client-ID header, so the client_id is embedded in the path instead.
export function buildFileDownloadUrl(filename: string): string {
  return `${API_BASE}/files/${getClientId()}/${encodeURIComponent(filename)}/download`
}
