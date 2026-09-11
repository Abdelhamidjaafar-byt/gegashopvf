import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { MapPin, Package, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useMyOrders } from '@/hooks/useOrders'
import { useAddresses } from '@/hooks/useAddresses'
import { useWishlist } from '@/contexts/WishlistContext'
import { useProducts } from '@/hooks/useCatalog'
import { formatPrice, formatDate } from '@/lib/format'
import type { Address, OrderStatus } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ProductCard from '@/components/ProductCard'
import { StatusBadge } from '@/components/StatusBadge'

const emptyAddress = { label: 'Home', full_name: '', phone: '', street: '', city: '', postal_code: '', country: 'Morocco', is_default: false }

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const [params] = useSearchParams()
  const { orders, loading: ordersLoading } = useMyOrders(user?.id)
  const { addresses, save, remove } = useAddresses(user?.id)
  const { ids: wishIds } = useWishlist()
  const { products } = useProducts()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Address> & { id?: string }>(emptyAddress)

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
        {user.role === 'admin' && (
          <Button asChild variant="outline" className="border-volt text-volt hover:bg-volt/10">
            <Link to="/admin">{t('nav.admin')}</Link>
          </Button>
        )}
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
                      <p className="font-mono text-sm font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('profile.orderPlaced')} {formatDate(o.created_at, i18n.language)} · {t('profile.items', { count: o.items.reduce((s, i) => s + i.qty, 0) })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status as OrderStatus} />
                      <span className="font-display font-bold">{formatPrice(Number(o.total), i18n.language)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 overflow-x-auto">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded border border-border bg-secondary px-2 py-1.5">
                        {item.image && <img src={item.image} alt="" className="h-8 w-8 rounded object-cover" />}
                        <span className="whitespace-nowrap text-xs">{item.name} × {item.qty}</span>
                      </div>
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
    </div>
  )
}
