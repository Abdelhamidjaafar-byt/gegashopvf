import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, getProductUrl } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function CartPage() {
  const { t, i18n } = useTranslation()
  const { items, subtotal, setQty, remove } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">{t('cart.title')}</h1>
        <p className="mt-4 text-muted-foreground">{t('cart.empty')}</p>
        <Button asChild className="mt-6 bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
          <Link to="/shop">{t('cart.emptyCta')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">{t('cart.title')}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-4 rounded-md border border-border bg-card p-4">
              <Link to={getProductUrl(product)} className="h-24 w-24 shrink-0 overflow-hidden rounded bg-secondary">
                {product.images[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <Link to={getProductUrl(product)} className="font-medium hover:text-volt">{product.name}</Link>
                <span className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(Number(product.price), i18n.language)}
                </span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(product.id, qty - 1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQty(product.id, Math.min(product.stock, qty + 1))}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => remove(product.id)} aria-label={t('cart.remove')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="hidden text-right font-display font-bold sm:block">
                {formatPrice(Number(product.price) * qty, i18n.language)}
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-md border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">{t('cart.subtotal')}</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">{t('cart.subtotal')}</span>
            <span className="font-semibold">{formatPrice(subtotal, i18n.language)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t('cart.shippingNote')}</p>
          <Separator className="my-4" />
          <Button asChild className="w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim" size="lg">
            <Link to="/checkout">{t('cart.checkout')}</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/shop">{t('cart.continue')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
