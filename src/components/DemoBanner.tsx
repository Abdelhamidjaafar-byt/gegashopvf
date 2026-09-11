import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isDemoMode } from '@/lib/supabase'

export default function DemoBanner() {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(false)
  if (!isDemoMode || dismissed) return null
  return (
    <div className="flex items-center justify-center gap-3 bg-volt px-4 py-1.5 text-xs font-semibold text-volt-fg">
      <Info className="h-3.5 w-3.5 shrink-0" />
      <span>{t('demo.banner')}</span>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
