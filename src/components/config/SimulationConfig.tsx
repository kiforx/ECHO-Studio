import { useState, useEffect } from 'react'
import { Info, Save, AlertCircle, CheckCircle } from 'lucide-react'
import type { Config } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'

interface SimulationConfigProps {
  config: Config
  onSave: (patch: Partial<Config>) => Promise<Config>
  saving: boolean
}

export function SimulationConfig({ config, onSave, saving }: SimulationConfigProps) {
  const [maxCycles, setMaxCycles] = useState(String(config.max_cycles))
  const [rngSeed, setRngSeed] = useState(config.rng_seed != null ? String(config.rng_seed) : '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setMaxCycles(String(config.max_cycles))
    setRngSeed(config.rng_seed != null ? String(config.rng_seed) : '')
  }, [config])

  const handleSave = async () => {
    setError(null)
    const cycles = parseInt(maxCycles)
    if (isNaN(cycles) || cycles < 1 || cycles > 1000) {
      setError('Max cycles must be between 1 and 1000')
      return
    }
    const seed = rngSeed.trim() === '' ? null : parseInt(rngSeed)
    if (rngSeed.trim() !== '' && (isNaN(seed!) || seed! < 0)) {
      setError('RNG seed must be a non-negative integer (or empty for random)')
      return
    }
    try {
      await onSave({ max_cycles: cycles, rng_seed: seed })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch {
      setError('Failed to save')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Configuration</CardTitle>
        <CardDescription>Simulation parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="max-cycles">Max Cycles</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Maximum number of simulation cycles per permutation. A cycle processes all cards
                left-to-right once. Win condition: all cards in Reality with 0 triggers.
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="max-cycles"
            type="number"
            min={1}
            max={1000}
            value={maxCycles}
            onChange={(e) => setMaxCycles(e.target.value)}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="rng-seed">RNG Seed</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-[#4a4a4a] cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Integer seed for reproducible runs. Leave empty for a random seed each
                run. Same seed + same config = identical results.
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="rng-seed"
            type="number"
            min={0}
            value={rngSeed}
            onChange={(e) => setRngSeed(e.target.value)}
            placeholder="Leave empty for random"
          />
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
