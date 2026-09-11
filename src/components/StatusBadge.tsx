import { useTranslation } from 'react-i18next'
import type { OrderStatus } from '@/types'

const styles: Record<OrderStatus, string> = {
  processing: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  shipped: 'bg-sky-400/10 text-sky-400 border-sky-400/30',
  delivered: 'bg-volt/10 text-volt border-volt/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {t(`admin.${status}`)}
    </span>
  )
}
