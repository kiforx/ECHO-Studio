import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import type { ProgressEventType } from '@/types'
import { Progress } from '@/components/ui/Progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface PhaseStep {
  phase: number
  name: string
  status: 'pending' | 'running' | 'done' | 'error'
  message?: string
}

export interface ProgressDetail {
  current: number
  total: number
  stage_label: string
  is_finishing: boolean
}

interface ProgressViewProps {
  events: ProgressEventType[]
  pct: number
  currentPhase: string
  elapsedMs: number
  progressDetail?: ProgressDetail | null
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function ProgressView({ events, pct, currentPhase, elapsedMs, progressDetail }: ProgressViewProps) {
  // Build phase list dynamically from events — only show phases the backend actually runs
  const phaseMap = new Map<number, PhaseStep>()

  for (const ev of events) {
    if (ev.type === 'phase_start' || ev.type === 'phase_complete') {
      if (!phaseMap.has(ev.phase)) {
        phaseMap.set(ev.phase, { phase: ev.phase, name: ev.name, status: 'pending' })
      }
      const step = phaseMap.get(ev.phase)!
      step.name = ev.name
      step.status = ev.type === 'phase_complete' ? 'done' : 'running'
      step.message = ev.message
    } else if (ev.type === 'error') {
      const running = Array.from(phaseMap.values()).find((p) => p.status === 'running')
      if (running) {
        running.status = 'error'
        running.message = ev.message
      }
    }
  }

  const phases = Array.from(phaseMap.values()).sort((a, b) => a.phase - b.phase)
  const isComplete = pct >= 100
  const hasError = events.some((e) => e.type === 'error')
  const runningStep = phases.find((p) => p.status === 'running')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analysis Progress</CardTitle>
          <span className="text-xs text-[hsl(210,15%,55%)]">
            {formatDuration(elapsedMs)} elapsed
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Overall progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[hsl(210,15%,55%)]">
            <span>{isComplete ? 'Complete' : hasError ? 'Failed' : currentPhase}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <Progress
            value={pct}
            variant={isComplete ? 'success' : 'default'}
            className="h-2.5"
          />
        </div>

        {/* Per-phase detail: progress bar while processing, label while finalizing */}
        {progressDetail && runningStep && (
          progressDetail.is_finishing ? (
            <p className="text-xs text-[hsl(210,15%,45%)] italic pl-1">
              {progressDetail.stage_label}…
            </p>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[hsl(210,15%,45%)]">
                <span className="font-mono">
                  {progressDetail.current} / {progressDetail.total}
                </span>
                <span>
                  {progressDetail.total > 0
                    ? Math.round(progressDetail.current / progressDetail.total * 100)
                    : 0}%
                </span>
              </div>
              <Progress
                value={progressDetail.total > 0
                  ? progressDetail.current / progressDetail.total * 100
                  : 0}
                variant="default"
                className="h-1"
              />
              <p className="text-xs text-[hsl(210,15%,45%)]">{progressDetail.stage_label}</p>
            </div>
          )
        )}

        {/* Phase steps — only phases the backend actually ran */}
        {phases.length > 0 && (
          <div className="space-y-1">
            {phases.map((step) => (
              <div key={step.phase} className="flex items-start gap-3 py-2">
                <div className="mt-0.5 shrink-0">
                  {step.status === 'done' ? (
                    <CheckCircle className="h-4 w-4 text-[hsl(155,60%,50%)]" />
                  ) : step.status === 'running' ? (
                    <Loader2 className="h-4 w-4 text-[hsl(210,100%,60%)] animate-spin" />
                  ) : step.status === 'error' ? (
                    <XCircle className="h-4 w-4 text-[hsl(355,75%,60%)]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-[hsl(222,20%,26%)]" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    step.status === 'done'    ? 'text-[hsl(210,20%,94%)]'
                    : step.status === 'running' ? 'text-[hsl(210,100%,60%)]'
                    : step.status === 'error'   ? 'text-[hsl(355,75%,60%)]'
                    : 'text-[hsl(210,10%,35%)]'
                  }`}>
                    {step.name}
                  </p>
                  {step.message && (
                    <p className="text-xs text-[hsl(210,15%,55%)] mt-0.5">{step.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder while no phase events received yet */}
        {phases.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-[hsl(210,15%,55%)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Starting…</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
