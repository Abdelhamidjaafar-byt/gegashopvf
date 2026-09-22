import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { MapPin, Package, Pencil, Plus, Star, Trash2, XCircle, Eye, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useMyOrders, cancelOrder } from '@/hooks/useOrders'
import { useAddresses } from '@/hooks/useAddresses'
import { useWishlist } from '@/contexts/WishlistContext'
import { useProducts } from '@/hooks/useCatalog'
import { formatPrice, formatDate } from '@/lib/format'
import type { Address, Order, OrderStatus } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import ProductCard from '@/components/ProductCard'
import { StatusBadge } from '@/components/StatusBadge'

import { FALLBACK_WHATSAPP, whatsappLink } from '@/lib/store'

const emptyAddress = { label: 'Home', full_name: '', phone: '', street: '', city: '', postal_code: '', country: 'Morocco', is_default: false }

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, hasAdminAccess, loading: authLoading, refreshProfile, updatePassword } = useAuth()
  const [params] = useSearchParams()
  const { orders, loading: ordersLoading, refetch: refetchOrders, setOrders } = useMyOrders(user?.id)
  const { addresses, save, remove } = useAddresses(user?.id)
  const { ids: wishIds } = useWishlist()
  const { products } = useProducts()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Address> & { id?: string }>(emptyAddress)
  const [accountName, setAccountName] = useState('')
  const [accountPhone, setAccountPhone] = useState('')
  const [savingAccount, setSavingAccount] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  useEffect(() => {
    if (user) {
      setAccountName(user.display_name || '')
      setAccountPhone(user.phone || '')
    }
  }, [user])

  const requestCancelOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId) || selectedOrder
    if (targetOrder) {
      setOrderToCancel(targetOrder)
    }
  }

  const confirmCancelOrderAction = async () => {
    if (!orderToCancel) return
    const orderId = orderToCancel.id
    const targetOrder = orderToCancel
    const shortId = '#' + orderId.slice(0, 8).toUpperCase()
    setOrderToCancel(null)

    // Optimistically update order status to 'cancelled' in local UI state immediately
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : null))
    }

    setCancellingId(orderId)
    const { error } = await cancelOrder(orderId)
    setCancellingId(null)

    if (error) {
      toast.error(error)
      refetchOrders()
    } else {
      toast.success(t('profile.orderCancelled'))
      refetchOrders()

      if (targetOrder) {
        const { data: adminPhone } = await supabase.rpc('admin_whatsapp')
        const message = t('profile.cancelWhatsappMessage', {
          id: shortId,
          name: user?.display_name || user?.email || '',
          email: user?.email || '',
          phone: targetOrder.shipping_address?.phone || user?.phone || '',
          items: targetOrder.items
            .map((i) => `• ${i.qty} × ${i.name} — ${formatPrice(i.price * i.qty, i18n.language)}`)
            .join('\n'),
          total: formatPrice(Number(targetOrder.total), i18n.language),
        })

        const link = whatsappLink((adminPhone as string | null) || FALLBACK_WHATSAPP, message)
        window.open(link, '_blank', 'noopener')
      }
    }
  }

  const submitAccount = async () => {
    if (!user) return
    setSavingAccount(true)
    const { error } = await supabase
      .from('users')
      .update({ display_name: accountName, phone: accountPhone })
      .eq('id', user.id)
    setSavingAccount(false)
    if (error) toast.error(error.message)
    else {
      await refreshProfile()
      toast.success(t('common.saved'))
    }
  }

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error(t('auth.passwordMinLength'))
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'))
      return
    }

    setSavingPassword(true)
    const { error } = await updatePassword(newPassword)
    setSavingPassword(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success(t('auth.passwordUpdated'))
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (authLoading) return null
  if (!user) return <Navigate to="/auth" replace />

  const wishlistProducts = products.filter((p) => wishIds.has(p.id))

  const openNew = () => {
    setEditing({ ...emptyAddress, full_name: user.display_name || '', phone: user.phone || '' })
    setDialogOpen(true)
  }

  const submitAddress = async () => {
    const { error } = await save(editing)
    if (error) toast.error(error)
    else {
      toast.success(t('common.saved'))
      setDialogOpen(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{user.display_name || user.email}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.email} · {t('profile.memberSince')} {formatDate(user.created_at, i18n.language)}
          </p>
        </div>
        {hasAdminAccess && (
          <Button asChild variant="outline" className="border-volt text-volt hover:bg-volt/10 font-semibold">
            <Link to="/admin">{t('nav.admin')}</Link>
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">{t('profile.accountDetails')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('auth.displayName')}</Label>
                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="mt-1.5 bg-secondary" />
              </div>
              <div>
                <Label>{t('profile.whatsappNumber')}</Label>
                <Input value={accountPhone} onChange={(e) => setAccountPhone(e.target.value)} placeholder="+212 …" className="mt-1.5 bg-secondary" />
              </div>
            </div>
            {user.role === 'admin' && (
              <p className="mt-3 text-xs text-muted-foreground">{t('profile.whatsappHint')}</p>
            )}
          </div>
          <div className="mt-6 pt-2">
            <Button onClick={submitAccount} disabled={savingAccount} className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
              {t('admin.save')}
            </Button>
          </div>
        </div>

        <form onSubmit={submitPasswordChange} className="rounded-md border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">{t('profile.changePasswordTitle')}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-new-password">{t('auth.newPassword')}</Label>
              <Input
                id="profile-new-password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1.5 bg-secondary"
              />
            </div>
            <div>
              <Label htmlFor="profile-confirm-password">{t('auth.confirmPassword')}</Label>
              <Input
                id="profile-confirm-password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 bg-secondary"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button type="submit" disabled={savingPassword} className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
              {t('profile.changePassword')}
            </Button>
          </div>
        </form>
      </div>

      <Tabs defaultValue={params.get('tab') || 'orders'} className="mt-8">
        <TabsList>
          <TabsTrigger value="orders"><Package className="mr-2 h-4 w-4" />{t('profile.orders')}</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin className="mr-2 h-4 w-4" />{t('profile.addresses')}</TabsTrigger>
          <TabsTrigger value="wishlist"><Star className="mr-2 h-4 w-4" />{t('profile.wishlistTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {ordersLoading ? null : orders.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t('profile.noOrders')}</p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="rounded-md border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(o)}
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          {t('profile.orderDetails')}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('profile.orderPlaced')} {formatDate(o.created_at, i18n.language)} · {t('profile.items', { count: o.items.reduce((s, i) => s + i.qty, 0) })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={o.status as OrderStatus} />
                      <span className="font-display font-bold">{formatPrice(Number(o.total), i18n.language)}</span>
                      {o.status === 'processing' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancellingId === o.id}
                          onClick={() => requestCancelOrder(o.id)}
                          className="h-8 text-xs font-semibold"
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          {t('profile.cancelOrder')}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 overflow-x-auto">
                    {o.items.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="flex items-center gap-2 rounded border border-border bg-secondary px-2.5 py-1.5 text-left hover:border-volt/50 hover:bg-volt/10 transition-colors"
                      >
                        {item.image && <img src={item.image} alt="" className="h-9 w-9 rounded object-cover border border-border" />}
                        <div>
                          <p className="whitespace-nowrap text-xs font-medium">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">× {item.qty} · {formatPrice(item.price, i18n.language)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Button onClick={openNew} className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
            <Plus className="mr-2 h-4 w-4" /> {t('profile.addAddress')}
          </Button>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.length === 0 && <p className="text-muted-foreground">{t('profile.noAddresses')}</p>}
            {addresses.map((a) => (
              <div key={a.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{a.label}</span>
                  {a.is_default && <Badge className="bg-volt text-volt-fg">{t('profile.default')}</Badge>}
                </div>
                <p className="mt-2 text-sm">{a.full_name}</p>
                <p className="text-sm text-muted-foreground">{a.street}, {a.city} {a.postal_code}</p>
                <p className="text-sm text-muted-foreground">{a.phone}</p>
                <div className="mt-3 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(a); setDialogOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={async () => { await remove(a.id); toast.success(t('common.deleted')) }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          {wishlistProducts.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t('profile.noWishlist')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {wishlistProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Address Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing.id ? t('profile.editAddress') : t('profile.addAddress')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t('profile.label')}</Label>
              <Input value={editing.label || ''} onChange={(e) => setEditing({ ...editing, label: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label>{t('checkout.fullName')}</Label>
              <Input value={editing.full_name || ''} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label>{t('checkout.phone')}</Label>
              <Input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label>{t('checkout.city')}</Label>
              <Input value={editing.city || ''} onChange={(e) => setEditing({ ...editing, city: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <div className="sm:col-span-2">
              <Label>{t('checkout.street')}</Label>
              <Input value={editing.street || ''} onChange={(e) => setEditing({ ...editing, street: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label>{t('checkout.postalCode')}</Label>
              <Input value={editing.postal_code || ''} onChange={(e) => setEditing({ ...editing, postal_code: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.is_default || false}
                onChange={(e) => setEditing({ ...editing, is_default: e.target.checked })}
                className="accent-[hsl(72,89%,58%)]"
              />
              {t('profile.setDefault')}
            </label>
          </div>
          <Button onClick={submitAddress} className="mt-4 bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
            {t('admin.save')}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Order & Product Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2 pr-6">
              <span>{t('profile.orderDetails')} #{selectedOrder?.id.slice(0, 8).toUpperCase()}</span>
              {selectedOrder && <StatusBadge status={selectedOrder.status as OrderStatus} />}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-2">
              {/* Info Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground border-b border-border pb-3">
                <span>{t('profile.orderPlaced')} {formatDate(selectedOrder.created_at, i18n.language)}</span>
                <span className="font-mono text-foreground font-semibold">
                  {t('profile.total')}: {formatPrice(Number(selectedOrder.total), i18n.language)}
                </span>
              </div>

              {/* Product Breakdown List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {t('profile.productDetails')}
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 p-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded border border-border bg-background">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground">
                              —
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('profile.unitPrice')}: {formatPrice(item.price, i18n.language)} · {t('product.qty')}: {item.qty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-sm">{formatPrice(item.price * item.qty, i18n.language)}</span>
                        {item.product_id && (
                          <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-volt hover:text-volt hover:bg-volt/10">
                            <Link to={`/product/${item.product_id}`} target="_blank">
                              <ExternalLink className="mr-1 h-3.5 w-3.5" />
                              {t('profile.viewProduct')}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Payment Summary */}
              <div className="grid gap-4 sm:grid-cols-2 rounded-md border border-border bg-card p-4 text-xs">
                <div>
                  <p className="font-semibold text-foreground uppercase tracking-wider mb-1">{t('profile.shippingAddress')}</p>
                  <p className="text-muted-foreground">{selectedOrder.shipping_address.full_name}</p>
                  <p className="text-muted-foreground">
                    {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city} {selectedOrder.shipping_address.postal_code}
                  </p>
                  <p className="text-muted-foreground">{selectedOrder.shipping_address.phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground uppercase tracking-wider mb-1">{t('profile.shippingMethod')}</p>
                  <p className="text-muted-foreground">{selectedOrder.shipping_method}</p>
                  <p className="font-semibold text-foreground uppercase tracking-wider mt-3 mb-1">{t('profile.paymentMethod')}</p>
                  <p className="text-muted-foreground">{selectedOrder.payment_method}</p>
                </div>
              </div>

              {/* Cancel Action inside modal */}
              {selectedOrder.status === 'processing' && (
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={cancellingId === selectedOrder.id}
                    onClick={() => requestCancelOrder(selectedOrder.id)}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    {t('profile.cancelOrder')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Alert Pop-Up */}
      <AlertDialog open={Boolean(orderToCancel)} onOpenChange={(o) => !o && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profile.cancelOrder')}</AlertDialogTitle>
            <AlertDialogDescription>
              {orderToCancel && t('profile.confirmCancelOrder', { id: '#' + orderToCancel.id.slice(0, 8).toUpperCase() })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrderAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              {t('profile.cancelOrder')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
