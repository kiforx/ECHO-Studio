import { Download, FileText, Table } from 'lucide-react'
import type { OutputFile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { buildDownloadUrl } from '@/api/analysis'

interface ResultsViewProps {
  jobId: string
  files: OutputFile[]
}

export function ResultsView({ jobId, files }: ResultsViewProps) {
  const downloadAll = () => {
    for (const file of files) {
      const a = document.createElement('a')
      a.href = buildDownloadUrl(jobId, file.filename)
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  if (files.length === 0) return null

  const txtFiles = files.filter((f) => f.filename.endsWith('.txt'))
  const csvFiles = files.filter((f) => f.filename.endsWith('.csv'))

  const FileGroup = ({ title, items }: { title: string; items: OutputFile[] }) =>
    items.length === 0 ? null : (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(210,15%,55%)]">{title}</p>
        <div className="space-y-1.5">
          {items.map((file) => (
            <div
              key={file.filename}
              className="flex items-center gap-3 rounded-lg border border-[hsl(222,20%,18%)] bg-[hsl(222,35%,11%)] px-3 py-2.5"
            >
              {file.filename.endsWith('.csv') ? (
                <Table className="h-4 w-4 text-[hsl(155,60%,50%)] shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-[hsl(210,100%,60%)] shrink-0" />
              )}
              <span className="flex-1 text-sm font-mono text-[hsl(210,20%,94%)] truncate">
                {file.filename}
              </span>
              <a
                href={buildDownloadUrl(jobId, file.filename)}
                download={file.filename}
              >
                <Button variant="ghost" size="icon-sm">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Files</CardTitle>
            <CardDescription>{files.length} file{files.length !== 1 ? 's' : ''} ready for download</CardDescription>
          </div>
          <Button size="sm" onClick={downloadAll}>
            <Download className="h-3.5 w-3.5" />
            Download All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileGroup title="Text Reports" items={txtFiles} />
        <FileGroup title="CSV Exports" items={csvFiles} />
      </CardContent>
    </Card>
  )
}
