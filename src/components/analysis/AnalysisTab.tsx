import { useEffect, useRef, useState } from 'react'
import { Play, StopCircle, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react'
import type { Config, OutputFile, ProgressEventType, ReportType } from '@/types'
import { fetchAvailableReports } from '@/api/reports'
import { runAnalysis, openEventStream, fetchCurrentJob, cancelJob } from '@/api/analysis'
import { Button } from '@/components/ui/Button'
import { ConfigPreview } from './ConfigPreview'
import { ReportSelector } from './ReportSelector'
import { ProgressView, type ProgressDetail } from './ProgressView'
import { ResultsView } from './ResultsView'

interface AnalysisTabProps {
  config: Config
}

type RunState = 'loading' | 'idle' | 'running' | 'completed' | 'failed'

export function AnalysisTab({ config }: AnalysisTabProps) {
  const [reports, setReports] = useState<ReportType[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [runState, setRunState] = useState<RunState>('loading')
  const [jobId, setJobId] = useState<string | null>(null)
  const [events, setEvents] = useState<ProgressEventType[]>([])
  const [pct, setPct] = useState(0)
  const [currentPhase, setCurrentPhase] = useState('')
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([])
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [progressDetail, setProgressDetail] = useState<ProgressDetail | null>(null)

  const esRef = useRef<EventSource | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const startTimer = (offsetMs = 0) => {
    startTimeRef.current = Date.now() - offsetMs
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current)
    }, 500)
  }
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const attachStream = (jid: string, resumeFromEvents: ProgressEventType[] = []) => {
    setJobId(jid)
    setEvents(resumeFromEvents)

    const lastPctEvent = [...resumeFromEvents].reverse().find(
      (e) => e.type === 'phase_start' || e.type === 'phase_complete'
    )
    if (lastPctEvent && (lastPctEvent.type === 'phase_start' || lastPctEvent.type === 'phase_complete')) {
      setPct(lastPctEvent.pct)
      setCurrentPhase(lastPctEvent.name)
    }

    const es = openEventStream(jid)
    esRef.current = es

    es.onmessage = (event) => {
      const data: ProgressEventType = JSON.parse(event.data)

      if (data.type === 'progress') {
        setProgressDetail({
          current: data.current,
          total: data.total,
          stage_label: data.stage_label,
          is_finishing: data.is_finishing,
        })
        return
      }

      setEvents((prev) => {
        const alreadySeen = prev.some(
          (e) => JSON.stringify(e) === JSON.stringify(data)
        )
        return alreadySeen ? prev : [...prev, data]
      })

      if (data.type === 'phase_start') {
        setPct(data.pct)
        setCurrentPhase(data.name)
        setProgressDetail(null)
      } else if (data.type === 'phase_complete') {
        setPct(data.pct)
        setCurrentPhase(data.name)
      } else if (data.type === 'complete') {
        setPct(100)
        setCurrentPhase('Complete')
        setOutputFiles(data.files)
        setRunState('completed')
        stopTimer()
        es.close()
      } else if (data.type === 'error') {
        setError(data.message)
        setRunState('failed')
        stopTimer()
        es.close()
      }
    }

    es.onerror = () => {
      setRunState((prev) => {
        if (prev === 'running') {
          stopTimer()
          setError('Lost connection to server. The analysis may still be running — refresh to check.')
          return 'failed'
        }
        return prev
      })
    }
  }

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const [reportsData, { job }] = await Promise.all([
        fetchAvailableReports(),
        fetchCurrentJob(),
      ])
      if (cancelled) return

      setReports(reportsData)
      setSelected(reportsData.map((r) => r.key))

      if (!job) {
        setRunState('idle')
        return
      }

      if (job.status === 'running') {
        setRunState('running')
        const created = job.created_at ? new Date(job.created_at).getTime() : Date.now()
        startTimer(Date.now() - created)
        attachStream(job.job_id)
      } else if (job.status === 'completed') {
        setRunState('completed')
        setJobId(job.job_id)
        setPct(100)
        setCurrentPhase('Complete')
        setOutputFiles(job.files)
      } else {
        setRunState('idle')
      }
    }

    init().catch(() => setRunState('idle'))
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    return () => {
      esRef.current?.close()
      stopTimer()
    }
  }, [])

  const handleRun = async () => {
    setRunState('running')
    setEvents([])
    setPct(0)
    setCurrentPhase('Starting…')
    setOutputFiles([])
    setError(null)
    setElapsedMs(0)

    try {
      const { job_id } = await runAnalysis({ selected_reports: selected })
      startTimer()
      attachStream(job_id)
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to start analysis')
      setRunState('idle')
    }
  }

  const handleCancel = async () => {
    if (!jobId) return
    setCancelling(true)
    try {
      await cancelJob(jobId)
      esRef.current?.close()
      stopTimer()
      setRunState('failed')
      setError('Analysis cancelled by user')
    } catch {
      setError('Failed to cancel — job may have already completed')
    } finally {
      setCancelling(false)
    }
  }

  const handleReset = () => {
    esRef.current?.close()
    stopTimer()
    setRunState('idle')
    setJobId(null)
    setEvents([])
    setPct(0)
    setOutputFiles([])
    setError(null)
    setElapsedMs(0)
    setCancelling(false)
    setProgressDetail(null)
  }

  if (runState === 'loading') {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-[#858585]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Checking for active jobs…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigPreview config={config} />
        <ReportSelector reports={reports} selected={selected} onChange={setSelected} />
      </div>

      {/* Concurrency banner */}
      {runState === 'running' && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-white shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#efefef]">Analysis is running</p>
              <p className="text-sm text-[#858585] mt-0.5">
                You can navigate away — progress is saved server-side and will be restored when you return.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancel}
            disabled={cancelling}
          >
            <StopCircle className="h-4 w-4" />
            {cancelling ? 'Cancelling…' : 'Cancel'}
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {runState === 'idle' && (
          <Button onClick={handleRun} disabled={selected.length === 0} size="lg">
            <Play className="h-5 w-5" />
            Run Analysis
          </Button>
        )}

        {runState === 'running' && (
          <Button variant="secondary" size="lg" disabled>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analysis Running…
          </Button>
        )}

        {(runState === 'completed' || runState === 'failed') && (
          <Button variant="secondary" size="lg" onClick={handleReset}>
            <RotateCcw className="h-5 w-5" />
            {runState === 'completed' ? 'Run Again' : 'Dismiss & Reset'}
          </Button>
        )}

        {runState === 'idle' && selected.length === 0 && (
          <p className="text-sm text-[hsl(355,75%,60%)]">Select at least one report to generate</p>
        )}

        {error && runState !== 'running' && (
          <div className="flex items-center gap-2.5 text-sm text-[hsl(355,75%,60%)]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {runState !== 'idle' && (
        <ProgressView
          events={events}
          pct={pct}
          currentPhase={currentPhase}
          elapsedMs={elapsedMs}
          progressDetail={progressDetail}
        />
      )}

      {runState === 'completed' && jobId && (
        <ResultsView jobId={jobId} files={outputFiles} />
      )}
    </div>
  )
}
