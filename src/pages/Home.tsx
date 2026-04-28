import { useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Settings2, BarChart3, Zap } from 'lucide-react'
import { ConfigTab } from '@/components/config/ConfigTab'
import { AnalysisTabWrapper } from '@/components/analysis/AnalysisTabWrapper'
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
  const [activeTab, setActiveTab] = useState('config')

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
            </TabsPrimitive.List>
          </div>
        </div>

        <div className="flex-1 bg-[#090909]">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <TabsPrimitive.Content
              value="config"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200"
            >
              <ConfigTab />
            </TabsPrimitive.Content>
            <TabsPrimitive.Content
              value="analysis"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200"
            >
              <AnalysisTabWrapper />
            </TabsPrimitive.Content>
          </div>
        </div>
      </TabsPrimitive.Root>
    </div>
  )
}
