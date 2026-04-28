import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import type { Config } from '@/types'
import { fetchConfig } from '@/api/config'
import { AnalysisTab } from './AnalysisTab'

export function AnalysisTabWrapper() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConfig()
      .then(setConfig)
      .catch(() => setError('Failed to load config'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-[#858585]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    )
  }

  if (!config || error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[hsl(355,75%,60%)]/30 bg-[hsl(355,75%,60%)]/8 px-5 py-4 text-sm text-[hsl(355,75%,60%)]">
        <AlertCircle className="h-5 w-5 shrink-0" />
        {error ?? 'Failed to load configuration'}
      </div>
    )
  }

  return <AnalysisTab config={config} />
}
