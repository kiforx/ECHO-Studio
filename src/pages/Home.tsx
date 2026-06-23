import { useEffect, useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Settings2, BarChart3, FolderOpen, Zap, Loader2, AlertCircle } from 'lucide-react'
import type { Card } from '@/types'
import { useConfig } from '@/hooks/useConfig'
import { useDecks } from '@/hooks/useDecks'
import { useGeneratedFiles } from '@/hooks/useGeneratedFiles'
import { fetchDeck } from '@/api/decks'
import { ConfigTab } from '@/components/config/ConfigTab'
import { AnalysisTabWrapper } from '@/components/analysis/AnalysisTabWrapper'
import { GeneratedFilesTab } from '@/components/files/GeneratedFilesTab'
import { cn } from '@/lib/utils'

function TabTrigger({ value, icon: Icon, label }: { value: string; icon: React.ElementType; label: string }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'flex items-center gap-2.5 px-6 py-4 text-sm font-semibold text-[#858585] border-b-2 border-transparent transition-all duration-200',
        'hover:text-[#efefef] hover:border-[#383838]',
        'data-[state=active]:text-white data-[state=active]:border-white',
        'focus-visible:outline-none'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsPrimitive.Trigger>
  )
}

export function Home() {
  const { config, loading: configLoading, saving, error: configError, save, reload: reloadConfig } = useConfig()
  const { decks, loading: decksLoading, reload: reloadDecks } = useDecks()
  const generatedFiles = useGeneratedFiles()
  const [deckCards, setDeckCards] = useState<Card[]>([])
  const [activeTab, setActiveTab] = useState('config')

  // noDeck: no decks exist, or the configured deck_version is not in the deck list
  const noDeck =
    !config ||
    decks.length === 0 ||
    config.deck_version === null ||
    !decks.find((d) => d.version === config.deck_version)

  // Load cards for the active deck reactively
  useEffect(() => {
    if (noDeck || !config || config.deck_version === null) {
      setDeckCards([])
      return
    }
    fetchDeck(config.deck_version)
      .then((d) => setDeckCards(d.cards))
      .catch(() => setDeckCards([]))
  }, [config?.deck_version, decks, noDeck])

  // After any deck mutation, reload decks AND config (deletion resets deck_version on the server)
  const handleDecksChanged = () => {
    reloadDecks()
    reloadConfig()
  }

  const loading = configLoading || decksLoading

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090909]">
        <div className="flex items-center gap-3 text-[#858585]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    )
  }

  if (!config && configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090909] px-8">
        <div className="flex items-center gap-3 rounded-2xl border border-[hsl(355,75%,60%)]/30 bg-[hsl(355,75%,60%)]/8 px-5 py-4 text-sm text-[hsl(355,75%,60%)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {configError}. Make sure the engine is running.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#272727] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#efefef] leading-none tracking-tight">
              Echo Studio
            </h1>
            <p className="text-sm text-[#858585] mt-1">Analysis and simulation control panel</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-[#272727] bg-[#111111]">
          <div className="max-w-7xl mx-auto px-8">
            <TabsPrimitive.List className="flex gap-0">
              <TabTrigger value="config" icon={Settings2} label="Configurations" />
              <TabTrigger value="analysis" icon={BarChart3} label="Analysis" />
              <TabTrigger value="files" icon={FolderOpen} label="Files" />
            </TabsPrimitive.List>
          </div>
        </div>

        <div className="flex-1 bg-[#090909]">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <TabsPrimitive.Content
              value="config"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200"
            >
              {config && (
                <ConfigTab
                  config={config}
                  save={save}
                  saving={saving}
                  decks={decks}
                  deckCards={deckCards}
                  noDeck={noDeck}
                  onDecksChanged={handleDecksChanged}
                />
              )}
            </TabsPrimitive.Content>
            <TabsPrimitive.Content
              value="analysis"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200"
            >
              <AnalysisTabWrapper
                config={config}
                noDeck={noDeck}
                generatedFiles={generatedFiles.files}
                filesLoading={generatedFiles.loading}
                onAnalysisFilesChanged={generatedFiles.reload}
              />
            </TabsPrimitive.Content>
            <TabsPrimitive.Content
              value="files"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200"
            >
              <GeneratedFilesTab
                files={generatedFiles.files}
                totalSizeBytes={generatedFiles.totalSizeBytes}
                loading={generatedFiles.loading}
                error={generatedFiles.error}
                reload={generatedFiles.reload}
                remove={generatedFiles.remove}
              />
            </TabsPrimitive.Content>
          </div>
        </div>
      </TabsPrimitive.Root>
    </div>
  )
}
