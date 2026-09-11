import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, CreditCard, Banknote, Truck, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useAddresses } from '@/hooks/useAddresses'
import { placeOrder } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/format'
import { SHIPPING_OPTIONS, type PaymentMethod, type ShippingMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

export default function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const { addresses } = useAddresses(user?.id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: user?.display_name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    postal_code: '',
    country: 'Morocco',
  })
  const [shipping, setShipping] = useState<ShippingMethod>('cathedis_standard')
  const [payment, setPayment] = useState<PaymentMethod>('cod')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const shippingCost = useMemo(() => {
    const opt = SHIPPING_OPTIONS[shipping]
    if (opt.freeOver && subtotal >= opt.freeOver) return 0
    return opt.price
  }, [shipping, subtotal])
  const total = subtotal + shippingCost

  const applyAddress = (id: string) => {
    const a = addresses.find((x) => x.id === id)
    if (a) {
      setForm({
        full_name: a.full_name,
        phone: a.phone,
        street: a.street,
        city: a.city,
        postal_code: a.postal_code || '',
        country: a.country,
      })
    }
  }

  const submit = async () => {
    if (!user) {
      toast.info(t('checkout.signInRequired'))
      navigate('/auth')
      return
    }
    if (!form.full_name || !form.phone || !form.street || !form.city) {
      toast.error(t('checkout.fillAll'))
      return
    }
    if (payment === 'card' && (!card.number || !card.name || !card.expiry || !card.cvc)) {
      toast.error(t('checkout.fillAll'))
      return
    }
    setPlacing(true)
    const { id, error } = await placeOrder({
      user_id: user.id,
      customer_email: user.email,
      items: items.map(({ product, qty }) => ({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        qty,
        image: product.images[0] || null,
      })),
      subtotal,
      shipping_method: shipping,
      shipping_cost: shippingCost,
      total,
      payment_method: payment,
      shipping_address: form,
    })
    setPlacing(false)
    if (error) {
      toast.error(error)
      return
    }
    setOrderId(id || null)
    clear()
    window.scrollTo(0, 0)
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-16 w-16 text-volt" />
        <h1 className="mt-6 font-display text-3xl font-bold">{t('checkout.successTitle')}</h1>
        <p className="mt-3 text-muted-foreground">{t('checkout.successBody', { id: orderId })}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
            <Link to="/profile">{t('checkout.viewOrders')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shop">{t('cart.continue')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <p className="text-muted-foreground">{t('cart.empty')}</p>
        <Button asChild className="mt-6 bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
          <Link to="/shop">{t('cart.emptyCta')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">{t('checkout.title')}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Address */}
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Truck className="h-5 w-5 text-volt" /> {t('checkout.shippingAddress')}
            </h2>
            {addresses.length > 0 && (
              <div className="mt-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t('checkout.savedAddresses')}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => applyAddress(a.id)}
                      className="rounded border border-border px-3 py-1.5 text-xs hover:border-volt hover:text-volt"
                    >
                      {a.label} — {a.city}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('checkout.fullName')} *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5 bg-secondary" />
              </div>
              <div>
                <Label>{t('checkout.phone')} *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 bg-secondary" placeholder="+212 …" />
              </div>
              <div className="sm:col-span-2">
                <Label>{t('checkout.street')} *</Label>
                <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="mt-1.5 bg-secondary" />
              </div>
              <div>
                <Label>{t('checkout.city')} *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5 bg-secondary" />
              </div>
              <div>
                <Label>{t('checkout.postalCode')}</Label>
                <Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="mt-1.5 bg-secondary" />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Zap className="h-5 w-5 text-volt" /> {t('checkout.shippingMethod')}
            </h2>
            <RadioGroup value={shipping} onValueChange={(v) => setShipping(v as ShippingMethod)} className="mt-4 space-y-3">
              {(Object.keys(SHIPPING_OPTIONS) as ShippingMethod[]).map((key) => {
                const opt = SHIPPING_OPTIONS[key]
                const free = opt.freeOver && subtotal >= opt.freeOver
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center justify-between rounded-md border p-4 transition-colors ${shipping === key ? 'border-volt bg-volt/5' : 'border-border hover:border-muted-foreground/40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={key} id={key} />
                      <div>
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.eta}</p>
                      </div>
                    </div>
                    <span className="font-display font-bold">
                      {free ? t('checkout.free') : formatPrice(opt.price, i18n.language)}
                    </span>
                  </label>
                )
              })}
            </RadioGroup>
            {shipping === 'cathedis_standard' && subtotal < (SHIPPING_OPTIONS.cathedis_standard.freeOver || 0) && (
              <p className="mt-3 text-xs text-muted-foreground">{t('home.freeShipping')}</p>
            )}
          </section>

          {/* Payment */}
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <CreditCard className="h-5 w-5 text-volt" /> {t('checkout.payment')}
            </h2>
            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)} className="mt-4 space-y-3">
              <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors ${payment === 'card' ? 'border-volt bg-volt/5' : 'border-border hover:border-muted-foreground/40'}`}>
                <RadioGroupItem value="card" id="card" />
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{t('checkout.card')}</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors ${payment === 'cod' ? 'border-volt bg-volt/5' : 'border-border hover:border-muted-foreground/40'}`}>
                <RadioGroupItem value="cod" id="cod" />
                <Banknote className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{t('checkout.cod')}</span>
              </label>
            </RadioGroup>
            {payment === 'card' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>{t('checkout.cardNumber')} *</Label>
                  <Input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="mt-1.5 bg-secondary" maxLength={19} />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t('checkout.cardName')} *</Label>
                  <Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="mt-1.5 bg-secondary" />
                </div>
                <div>
                  <Label>{t('checkout.cardExpiry')} *</Label>
                  <Input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="12/28" className="mt-1.5 bg-secondary" maxLength={5} />
                </div>
                <div>
                  <Label>{t('checkout.cardCvc')} *</Label>
                  <Input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" className="mt-1.5 bg-secondary" maxLength={4} />
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">{t('checkout.cardDemoNote')}</p>
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-md border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold">{t('checkout.title')}</h2>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-secondary">
                  {product.images[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">× {qty}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(Number(product.price) * qty, i18n.language)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('checkout.subtotal')}</span>
              <span>{formatPrice(subtotal, i18n.language)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('checkout.shipping')}</span>
              <span>{shippingCost === 0 ? t('checkout.free') : formatPrice(shippingCost, i18n.language)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-display text-lg font-bold">
              <span>{t('checkout.total')}</span>
              <span className="text-volt">{formatPrice(total, i18n.language)}</span>
            </div>
          </div>
          <Button
            onClick={submit}
            disabled={placing}
            className="mt-6 w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim"
            size="lg"
          >
            {placing ? t('checkout.placing') : t('checkout.placeOrder')}
          </Button>
        </div>
      </div>
    </div>
  )
}
