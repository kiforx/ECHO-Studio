import { TooltipProvider } from '@/components/ui/Tooltip'
import { Home } from '@/pages/Home'

export default function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <Home />
    </TooltipProvider>
  )
}
