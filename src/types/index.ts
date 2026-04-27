export type CardType = 'A' | 'B' | 'C'
export type Nominal = 1 | 2 | 3 | 4

export interface Card {
  id: number
  type: CardType
  nominal: Nominal
  present_trigger: string
  present_effect: string
  echo_trigger: string
  echo_effect: string
}

export interface DeckSummary {
  version: number
  card_count: number
  types: string[]
}

export interface DeckDetail {
  version: number
  card_count: number
  types: string[]
  cards: Card[]
}

export interface Config {
  deck_version: number
  cards_file: string
  recipe: Record<string, number>
  max_cycles: number
  rng_seed: number | null
  custom_set_ids: number[]
  // CSV export
  csv_export_mode: 'all' | 'range' | 'single_set_index' | 'custom_set_ids'
  csv_set_range: [number, number]
  csv_single_set_index: number
  csv_custom_set_ids: number[]
}

export interface Constants {
  triggers: string[]
  effects: string[]
  card_types: string[]
  nominal_range: number[]
}

export interface ReportType {
  key: string
  label: string
  description: string
  extension: string
}

export interface OutputFile {
  key: string
  filename: string
}

export type JobStatus = 'running' | 'completed' | 'failed' | 'queued'

export interface JobSummary {
  job_id: string
  status: JobStatus
  pct: number
  current_phase: string
  files: OutputFile[]
  created_at: string
  updated_at: string
  error: string | null
}

export type ProgressEventType =
  | { type: 'phase_start'; phase: number; total: number; name: string; pct: number; message: string }
  | { type: 'phase_complete'; phase: number; total: number; name: string; pct: number; message: string }
  | { type: 'complete'; files: OutputFile[] }
  | { type: 'error'; message: string }
  | { type: 'progress'; analysis_type: string; current: number; total: number; percent: number; stage_label: string; is_finishing: boolean }
