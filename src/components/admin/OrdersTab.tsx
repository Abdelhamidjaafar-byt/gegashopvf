import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAllOrders, updateOrderStatus } from '@/hooks/useOrders'
import { formatPrice, formatDate } from '@/lib/format'
import type { OrderStatus } from '@/types'
import { StatusBadge } from '@/components/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const statuses: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersTab() {
  const { t, i18n } = useTranslation()
  const { orders, loading, refetch } = useAllOrders(true)

  const setStatus = async (id: string, status: OrderStatus) => {
    const { error } = await updateOrderStatus(id, status)
    if (error) toast.error(error)
    else {
      toast.success(t('common.saved'))
      refetch()
    }
  }

  if (loading) return null
  if (orders.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">{t('admin.noOrders')}</p>
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.order')}</TableHead>
            <TableHead>{t('admin.customer')}</TableHead>
            <TableHead>{t('admin.date')}</TableHead>
            <TableHead>{t('checkout.total')}</TableHead>
            <TableHead>{t('admin.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell>
                <p className="font-mono text-xs font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="mt-1 max-w-56 truncate text-xs text-muted-foreground">
                  {o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {o.shipping_address.full_name} · {o.shipping_address.phone} · {o.shipping_address.street}, {o.shipping_address.city}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {o.shipping_method === 'cathedis_express' ? 'Cathedis Express' : 'Cathedis Standard'} · {o.payment_method === 'cod' ? 'COD' : 'Card'}
                </p>
              </TableCell>
              <TableCell className="text-sm">{o.customer_email}</TableCell>
              <TableCell className="text-sm">{formatDate(o.created_at, i18n.language)}</TableCell>
              <TableCell className="font-semibold">{formatPrice(Number(o.total), i18n.language)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  <Select value={o.status} onValueChange={(v) => setStatus(o.id, v as OrderStatus)}>
                    <SelectTrigger className="h-8 w-36 bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>{t(`admin.${s}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
