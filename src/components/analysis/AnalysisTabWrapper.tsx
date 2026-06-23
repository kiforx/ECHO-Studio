import { Layers } from 'lucide-react'
import type { Config, GeneratedFile } from '@/types'
import { AnalysisTab } from './AnalysisTab'

interface AnalysisTabWrapperProps {
  config: Config | null
  noDeck: boolean
  generatedFiles: GeneratedFile[]
  filesLoading: boolean
  onAnalysisFilesChanged: () => void
}

export function AnalysisTabWrapper({
  config, noDeck, generatedFiles, filesLoading, onAnalysisFilesChanged,
}: AnalysisTabWrapperProps) {
  if (noDeck || !config) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-[#272727]">
          <Layers className="h-6 w-6 text-[#4a4a4a]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#858585]">No deck configured</p>
          <p className="text-sm text-[#4a4a4a] mt-1">
            Go to <strong className="text-[#858585]">Configurations → Deck Management</strong> and create a deck first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AnalysisTab
      config={config}
      generatedFiles={generatedFiles}
      filesLoading={filesLoading}
      onFilesChanged={onAnalysisFilesChanged}
    />
  )
}
