import { useState, useEffect } from 'react'
import { Info, Save, AlertCircle, CheckCircle } from 'lucide-react'
import type { Config } from '@/types'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/Select'

interface NominalChangeConfigProps {
  config: Config
  onSave: (patch: Partial<Config>) => Promise<Config>
  saving: boolean
}

const MODE_INFO: Record<Config['nominal_change_mode'], string> = {
  until_solution_found:
    'Stops searching as soon as a depth produces a solution: skips double-change ' +
    'analysis once single-change finds one, and skips both when a base solution ' +
    'already exists. Cheaper, recommended for most runs.',
  legacy:
    'Runs every enabled depth (single, then double) for every nominal-sensitive set, ' +
    'regardless of whether an earlier depth already found a solution. More exhaustive ' +
    'and significantly more expensive.',
}

export function NominalChangeConfig({ config, onSave, saving }: NominalChangeConfigProps) {
  const [mode, setMode] = useState<Config['nominal_change_mode']>(config.nominal_change_mode)
  const [enableSingle, setEnableSingle] = useState(config.nominal_change_enable_single)
  const [enableDouble, setEnableDouble] = useState(config.nominal_change_enable_double)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setMode(config.nominal_change_mode)
    setEnableSingle(config.nominal_change_enable_single)
    setEnableDouble(config.nominal_change_enable_double)
  }, [config])

  const handleSave = async () => {
    setError(null)
    try {
      await onSave({
        nominal_change_mode: mode,
        nominal_change_enable_single: enableSingle,
        nominal_change_enable_double: enableDouble,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch {
      setError('Failed to save')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nominal-Change Configuration</CardTitle>
        <CardDescription>Controls how exhaustively single/double nominal modifications are searched</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="nominal-change-mode">Mode</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-72">{MODE_INFO[mode]}</TooltipContent>
            </Tooltip>
          </div>
          <Select value={mode} onValueChange={(v) => setMode(v as Config['nominal_change_mode'])}>
            <SelectTrigger id="nominal-change-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="until_solution_found">Until Solution Found</SelectItem>
              <SelectItem value="legacy">Legacy</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-[#858585]">{MODE_INFO[mode]}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="enable-single"
              checked={enableSingle}
              onCheckedChange={(v) => setEnableSingle(v === true)}
            />
            <Label htmlFor="enable-single" className="cursor-pointer">Enable single-change analysis</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-72">
                Try every ±1 modification on a single card's nominal value. Disabling this
                also disables the dependent Gate 3 short-circuit in "Until Solution Found" mode.
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2.5">
            <Checkbox
              id="enable-double"
              checked={enableDouble}
              onCheckedChange={(v) => setEnableDouble(v === true)}
            />
            <Label htmlFor="enable-double" className="cursor-pointer">Enable double-change analysis</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-72">
                Try every pair of ±1 modifications across two cards' nominal values.
                The most expensive depth — disable to skip it entirely.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 text-sm text-[hsl(355,75%,60%)]">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} size="sm">
          {success ? (
            <><CheckCircle className="h-4 w-4" /> Saved</>
          ) : saving ? (
            'Saving…'
          ) : (
            <><Save className="h-4 w-4" /> Save</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
