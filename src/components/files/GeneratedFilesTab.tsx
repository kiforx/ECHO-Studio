import { useState } from 'react'
import { Download, FileText, Table, Trash2, FolderOpen, RefreshCw } from 'lucide-react'
import type { GeneratedFile } from '@/types'
import { buildFileDownloadUrl } from '@/api/files'
import { formatBytes } from '@/lib/format-bytes'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog'

interface GeneratedFilesTabProps {
  files: GeneratedFile[]
  totalSizeBytes: number
  loading: boolean
  error: string | null
  reload: () => void
  remove: (filename: string) => Promise<void>
}

export function GeneratedFilesTab({ files, totalSizeBytes, loading, error, reload, remove }: GeneratedFilesTabProps) {
  const [deleteFilename, setDeleteFilename] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteFilename) return
    setDeleting(true)
    await remove(deleteFilename)
    setDeleteFilename(null)
    setDeleting(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Files</CardTitle>
            <CardDescription className="mt-1.5">
              All reports and CSV exports generated for you, available to download or delete at any time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted">{files.length} file{files.length !== 1 ? 's' : ''} · {formatBytes(totalSizeBytes)}</Badge>
            <Button variant="ghost" size="icon-sm" onClick={reload} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#858585]">
            Loading files…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-sm text-[hsl(355,75%,60%)]">
            {error}
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <FolderOpen className="h-12 w-12 text-[#4a4a4a]" />
            <p className="text-sm text-[#858585]">No generated files yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.filename}
                className="flex items-center gap-3 rounded-xl border border-[#272727] bg-[#1a1a1a] px-4 py-3 transition-all duration-200 hover:border-[#383838] hover:bg-[#222222]"
              >
                {file.filename.endsWith('.csv') ? (
                  <Table className="h-4 w-4 text-[hsl(155,60%,50%)] shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-white shrink-0" />
                )}
                <span className="flex-1 text-sm font-mono text-[#efefef] truncate">
                  {file.filename}
                </span>
                <span className="text-xs text-[#858585] tabular-nums">
                  {formatBytes(file.size_bytes)}
                </span>
                <a href={buildFileDownloadUrl(file.filename)} download={file.filename}>
                  <Button variant="ghost" size="icon-sm" title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteFilename(file.filename)}
                  className="text-[hsl(355,75%,60%)] hover:text-[hsl(355,75%,60%)] hover:bg-[hsl(355,75%,60%)]/10"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete confirm */}
      <Dialog open={deleteFilename !== null} onOpenChange={(o) => !o && setDeleteFilename(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this file?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong className="break-all">{deleteFilename}</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteFilename(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
