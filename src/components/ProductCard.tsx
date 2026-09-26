import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Eye, Heart, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice, getProductUrl } from '@/lib/format'
import { Button } from '@/components/ui/button'
import QuickView from './QuickView'

export function StockBadge({ stock }: { stock: number }) {
  const { t } = useTranslation()
  if (stock <= 0)
    return <span className="text-[11px] font-semibold uppercase tracking-wide text-destructive">{t('shop.outOfStock')}</span>
  if (stock <= 5)
    return <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-400">{t('shop.lowStock', { count: stock })}</span>
  return <span className="text-[11px] font-semibold uppercase tracking-wide text-volt">{t('shop.inStock')}</span>
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { t, i18n } = useTranslation()
  const { add } = useCart()
  const { has, toggle } = useWishlist()
  const { user } = useAuth()
  const [quickView, setQuickView] = useState(false)
  const wished = has(product.id)

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    add(product)
    toast.success(t('product.addedToCart'))
  }

  const toggleWish = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      toast.info(t('product.reviewSignIn'))
      return
    }
    const now = await toggle(product.id)
    toast.success(t(now ? 'product.addedToWishlist' : 'product.removedFromWishlist'))
  }

  const isNewProduct =
    Boolean((product as any).is_new) ||
    String(product.specs?.is_new) === 'true' ||
    (new Date().getTime() - new Date(product.created_at).getTime() < 14 * 24 * 60 * 60 * 1000)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
      >
        <Link
          to={getProductUrl(product)}
          className="group block overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-volt/60"
        >
          <div className="relative aspect-square overflow-hidden bg-secondary">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-4xl font-bold text-muted-foreground/30">
                {product.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button size="icon" variant="secondary" className="h-8 w-8" onClick={toggleWish} aria-label={t('nav.wishlist')}>
                <Heart className={`h-4 w-4 ${wished ? 'fill-volt text-volt' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault()
                  setQuickView(true)
                }}
                aria-label={t('product.quickView')}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 items-start">
              {isNewProduct && (
                <span className="rounded bg-volt px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-volt-fg shadow-md border border-volt/30">
                  {t('badge.new', 'NOUVEAU')}
                </span>
              )}
              {product.is_featured && (
                <span className="rounded bg-secondary/90 border border-border/80 px-1.5 py-0.5 text-[10px] font-bold text-volt shadow">
                  ★
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1.5 p-4">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <StockBadge stock={product.stock} />
            <div className="flex items-center justify-between pt-1">
              <span className="font-display text-base font-bold">{formatPrice(Number(product.price), i18n.language)}</span>
              <Button
                size="icon"
                className="h-8 w-8 bg-volt text-volt-fg hover:bg-volt-dim disabled:opacity-40"
                onClick={addToCart}
                disabled={product.stock <= 0}
                aria-label={t('product.addToCart')}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>
      {quickView && <QuickView product={product} onClose={() => setQuickView(false)} />}
    </>
  )
}
