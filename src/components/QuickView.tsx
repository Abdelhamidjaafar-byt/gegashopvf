import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Heart, Minus, Plus, ShoppingCart, Truck } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { useBrands, useCategories } from '@/hooks/useCatalog'
import { useReviews } from '@/hooks/useReviews'
import { formatPrice, getProductUrl } from '@/lib/format'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StockBadge } from './ProductCard'
import RatingStars from './RatingStars'

export default function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const { add } = useCart()
  const { has, toggle } = useWishlist()
  const { user } = useAuth()
  const { brands } = useBrands()
  const { categories } = useCategories()
  const { reviews, average } = useReviews(product.id)
  const navigate = useNavigate()

  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)

  const brand = brands.find((b) => b.id === product.brand_id)
  const category = categories.find((c) => c.id === product.category_id)
  const wished = has(product.id)

  const isNewProduct =
    Boolean((product as any).is_new) ||
    String(product.specs?.is_new) === 'true' ||
    new Date().getTime() - new Date(product.created_at).getTime() < 14 * 24 * 60 * 60 * 1000

  const cleanSpecs = useMemo(() => {
    return Object.entries(product.specs || {}).filter(
      ([k, v]) => !['is_new', 'NEW Arrival'].includes(k) && typeof v === 'string' && v.trim() !== ''
    )
  }, [product.specs])

  const handleViewWholeThing = () => {
    navigate(getProductUrl(product))
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl lg:max-w-4xl p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/80">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Left: Gallery */}
          <div className="flex flex-col p-6 bg-secondary/30 border-b md:border-b-0 md:border-r border-border/60">
            <div className="aspect-square overflow-hidden rounded-lg border border-border/80 bg-secondary relative">
              {product.images[imgIdx] || product.images[0] ? (
                <img
                  src={product.images[imgIdx] || product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-5xl font-bold text-muted-foreground/30">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              {isNewProduct && (
                <div className="absolute top-3 left-3">
                  <span className="rounded bg-volt/20 border border-volt/50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-volt backdrop-blur-md shadow-[0_0_10px_rgba(209,166,91,0.25)]">
                    {t('badge.newArrival', 'NOUVEL ARRIVAGE')}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail switcher if multiple images exist */}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border transition-all ${
                      i === imgIdx ? 'border-volt ring-2 ring-volt/40' : 'border-border/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info, Specs Only & Actions */}
          <div className="flex flex-col p-6 gap-4">
            {/* Brand & Category */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {brand?.name} {category && `· ${category.name}`}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold leading-tight">{product.name}</h2>

              {/* Reviews */}
              <div className="mt-2 flex items-center gap-2">
                <RatingStars value={average} size={3.5} />
                <span className="text-xs text-muted-foreground">
                  {average ? average.toFixed(1) : '—'} ({reviews.length})
                </span>
              </div>
            </div>

            {/* Price & Stock status */}
            <div className="flex items-baseline justify-between border-y border-border/60 py-2.5">
              <span className="font-display text-2xl font-black text-volt">
                {formatPrice(Number(product.price), i18n.language)}
              </span>
              <StockBadge stock={product.stock} />
            </div>

            {/* SPECS ONLY section */}
            <div className="flex-1 min-h-0 flex flex-col">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t('product.specs')}
              </h3>

              {cleanSpecs.length > 0 ? (
                <dl className="max-h-48 overflow-y-auto divide-y divide-border/60 rounded-md border border-border/70 text-xs bg-card">
                  {cleanSpecs.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 gap-2 px-3 py-2 bg-secondary/15 even:bg-transparent">
                      <dt className="font-medium text-muted-foreground truncate">{k}</dt>
                      <dd className="col-span-2 font-medium truncate">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="rounded-md border border-border/60 bg-secondary/10 p-3 text-xs text-muted-foreground">
                  {product.description ? (
                    <p className="line-clamp-3">{product.description}</p>
                  ) : (
                    <p className="italic">
                      {i18n.language?.startsWith('en')
                        ? 'No specifications listed for this product.'
                        : 'Aucune caractéristique technique répertoriée pour ce produit.'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions: Qty, Add to Cart, Wishlist */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center rounded-md border border-border bg-background">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1 bg-volt text-volt-fg hover:bg-volt-dim font-bold h-9"
                disabled={product.stock <= 0}
                onClick={() => {
                  add(product, qty)
                  toast.success(t('product.addedToCart'))
                  onClose()
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> {t('product.addToCart')}
              </Button>

              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 flex-shrink-0"
                onClick={async () => {
                  if (!user) {
                    toast.info(t('product.reviewSignIn'))
                    return
                  }
                  const now = await toggle(product.id)
                  toast.success(t(now ? 'product.addedToWishlist' : 'product.removedFromWishlist'))
                }}
                aria-label={t('nav.wishlist')}
              >
                <Heart className={`h-4 w-4 ${wished ? 'fill-volt text-volt' : ''}`} />
              </Button>
            </div>

            {/* Free shipping */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5 text-volt" /> {t('home.freeShipping')}
            </div>

            {/* BUTTON TO VIEW WHOLE THING */}
            <Button
              variant="outline"
              className="w-full border-volt/40 text-volt hover:bg-volt/10 font-bold justify-between group mt-1"
              onClick={handleViewWholeThing}
            >
              <span>{t('product.viewFullDetails')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
