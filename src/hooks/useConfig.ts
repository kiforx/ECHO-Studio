import { useCallback, useEffect, useState } from 'react'
import { fetchConfig, updateConfig } from '@/api/config'
import type { Config } from '@/types'

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    fetchConfig()
      .then(setConfig)
      .catch(() => setError('Failed to load config'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const save = useCallback(async (patch: Partial<Config>) => {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateConfig(patch)
      setConfig(updated)
      return updated
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Failed to save config'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      throw e
    } finally {
      setSaving(false)
    }
  }, [])

  return { config, loading, saving, error, save, reload: reload }
}
