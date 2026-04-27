import { api } from './client'
import type { ReportType } from '@/types'

export async function fetchAvailableReports(): Promise<ReportType[]> {
  const { data } = await api.get('/reports/available')
  return data.reports
}
