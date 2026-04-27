import { Info } from 'lucide-react'
import type { ReportType } from '@/types'
import { Checkbox } from '@/components/ui/Checkbox'
import { Badge } from '@/components/ui/Badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ReportSelectorProps {
  reports: ReportType[]
  selected: string[]
  onChange: (keys: string[]) => void
}

export function ReportSelector({ reports, selected, onChange }: ReportSelectorProps) {
  const toggle = (key: string) => {
    onChange(
      selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]
    )
  }
  const selectAll = () => onChange(reports.map((r) => r.key))
  const clearAll = () => onChange([])

  const txtReports = reports.filter((r) => r.extension === 'txt')
  const csvReports = reports.filter((r) => r.extension === 'csv')

  const Group = ({ title, items }: { title: string; items: ReportType[] }) => (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(210,15%,55%)]">
        {title}
      </p>
      <div className="space-y-2">
        {items.map((report) => (
          <label
            key={report.key}
            className="flex items-start gap-3 rounded-lg p-3 cursor-pointer border border-transparent hover:border-[hsl(222,20%,18%)] hover:bg-[hsl(222,35%,11%)] transition-colors"
          >
            <Checkbox
              checked={selected.includes(report.key)}
              onCheckedChange={() => toggle(report.key)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[hsl(210,20%,94%)]">{report.label}</span>
                <Badge variant={report.extension === 'csv' ? 'default' : 'muted'} className="text-[10px]">
                  .{report.extension}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-[hsl(210,15%,55%)]">{report.description}</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[hsl(210,10%,35%)] mt-0.5 cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-64">{report.description}</TooltipContent>
            </Tooltip>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Output File Selection</CardTitle>
            <CardDescription>Choose which reports to generate</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll}>Select all</Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Group title="Text Reports (.txt)" items={txtReports} />
        <Group title="CSV Exports (.csv)" items={csvReports} />
      </CardContent>
    </Card>
  )
}
