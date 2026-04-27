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
      <div className="flex items-center justify-center py-24 gap-3 text-[hsl(210,15%,55%)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading…</span>
      </div>
    )
  }

  if (!config || error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[hsl(355,75%,60%)]/30 bg-[hsl(355,75%,60%)]/10 px-5 py-4 text-sm text-[hsl(355,75%,60%)]">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error ?? 'Failed to load configuration'}
      </div>
    )
  }

  return <AnalysisTab config={config} />
}
