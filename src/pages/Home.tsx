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
        'flex items-center gap-2 px-5 py-3 text-sm font-medium text-[hsl(210,15%,55%)] border-b-2 border-transparent transition-all',
        'hover:text-[hsl(210,20%,94%)] hover:border-[hsl(222,20%,26%)]',
        'data-[state=active]:text-[hsl(210,20%,94%)] data-[state=active]:border-[hsl(210,100%,60%)]',
        'focus-visible:outline-none'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsPrimitive.Trigger>
  )
}

export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[hsl(222,20%,18%)] bg-[hsl(222,40%,8%)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(210,100%,60%)]/15 text-[hsl(210,100%,60%)]">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[hsl(210,20%,94%)] leading-none">
              Echo Analysis Platform
            </h1>
            <p className="text-xs text-[hsl(210,15%,55%)] mt-0.5">Card game simulation engine</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <TabsPrimitive.Root defaultValue="config" className="flex-1 flex flex-col">
        <div className="border-b border-[hsl(222,20%,18%)] bg-[hsl(222,40%,8%)]">
          <div className="max-w-7xl mx-auto px-6">
            <TabsPrimitive.List className="flex gap-0">
              <TabTrigger value="config" icon={Settings2} label="Configurations" />
              <TabTrigger value="analysis" icon={BarChart3} label="Analysis" />
            </TabsPrimitive.List>
          </div>
        </div>

        <div className="flex-1 bg-[hsl(222,47%,5%)]">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <TabsPrimitive.Content value="config" className="outline-none">
              <ConfigTab />
            </TabsPrimitive.Content>
            <TabsPrimitive.Content value="analysis" className="outline-none">
              <AnalysisTabWrapper />
            </TabsPrimitive.Content>
          </div>
        </div>
      </TabsPrimitive.Root>
    </div>
  )
}
