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
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#858585]">{title}</p>
        <div className="space-y-2">
          {items.map((file) => (
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
              <a
                href={buildDownloadUrl(jobId, file.filename)}
                download={file.filename}
              >
                <Button variant="ghost" size="icon-sm">
                  <Download className="h-4 w-4" />
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
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <FileGroup title="Text Reports" items={txtFiles} />
        <FileGroup title="CSV Exports" items={csvFiles} />
      </CardContent>
    </Card>
  )
}
