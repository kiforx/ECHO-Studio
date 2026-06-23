import { useCallback, useEffect, useState } from 'react'
import { fetchGeneratedFiles, deleteGeneratedFile } from '@/api/files'
import type { GeneratedFile } from '@/types'

export function useGeneratedFiles() {
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [totalSizeBytes, setTotalSizeBytes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    fetchGeneratedFiles()
      .then((res) => {
        setFiles(res.files)
        setTotalSizeBytes(res.total_size_bytes)
        setError(null)
      })
      .catch(() => setError('Failed to load generated files'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const remove = useCallback(
    async (filename: string) => {
      await deleteGeneratedFile(filename)
      reload()
    },
    [reload]
  )

  return { files, totalSizeBytes, loading, error, reload, remove }
}
