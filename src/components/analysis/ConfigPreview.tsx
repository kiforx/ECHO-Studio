import type { Config } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface ConfigPreviewProps {
  config: Config
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-[hsl(210,15%,55%)] shrink-0">{label}</span>
      <span className="text-sm font-medium text-[hsl(210,20%,94%)] text-right">{value}</span>
    </div>
  )
}

function csvModeLabel(cfg: Config): React.ReactNode {
  switch (cfg.csv_export_mode) {
    case 'all': return 'All sets'
    case 'range': return `Sets ${cfg.csv_set_range[0]}–${cfg.csv_set_range[1]}`
    case 'single_set_index': return `Set #${cfg.csv_single_set_index}`
    case 'custom_set_ids':
      return (
        <span className="flex flex-wrap gap-1 justify-end">
          {cfg.csv_custom_set_ids.map((id) => (
            <Badge key={id} variant="muted">{id}</Badge>
          ))}
        </span>
      )
    default: return cfg.csv_export_mode
  }
}

export function ConfigPreview({ config }: ConfigPreviewProps) {
  const recipeStr = Object.entries(config.recipe)
    .map(([k, v]) => `${v}${k}`)
    .join(' + ')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Configuration</CardTitle>
        <CardDescription>Settings used for this analysis run</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-[hsl(222,20%,18%)]">
          <Row label="Deck" value={
            <Badge variant="default">v{config.deck_version} — {config.cards_file}</Badge>
          } />
          <Row label="Recipe" value={recipeStr} />
          <Row label="Max Cycles" value={config.max_cycles} />
          <Row label="RNG Seed" value={
            config.rng_seed != null ? config.rng_seed : <span className="text-[hsl(210,10%,35%)]">random</span>
          } />
          <Row label="Single-Set IDs" value={
            <span className="flex flex-wrap gap-1 justify-end">
              {config.custom_set_ids.map((id) => (
                <Badge key={id} variant="muted">{id}</Badge>
              ))}
            </span>
          } />
          <Row label="CSV Filter" value={csvModeLabel(config)} />
        </div>
      </CardContent>
    </Card>
  )
}
