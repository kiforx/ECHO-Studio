import { useEffect, useState } from 'react'
import { fetchConstants } from '@/api/constants'
import type { Constants } from '@/types'

export function useConstants() {
  const [data, setData] = useState<Constants | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConstants()
      .then(setData)
      .catch(() => setError('Failed to load constants'))
      .finally(() => setLoading(false))
  }, [])

  return { constants: data, loading, error }
}
