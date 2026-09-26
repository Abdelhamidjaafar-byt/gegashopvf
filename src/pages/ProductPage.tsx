import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Heart, Minus, Plus, ShoppingCart, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useProducts, useBrands, useCategories } from '@/hooks/useCatalog'
import { useReviews } from '@/hooks/useReviews'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice, formatDate, slugify } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import ProductCard, { StockBadge } from '@/components/ProductCard'
import RatingStars from '@/components/RatingStars'
import RecentlyViewed from '@/components/RecentlyViewed'
import { filterPublicSpecs } from '@/lib/specs'

export default function ProductPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { products, loading } = useProducts()
  const { brands } = useBrands()
  const { categories } = useCategories()
  const { track } = useRecentlyViewed()
  const { add } = useCart()
  const { has, toggle } = useWishlist()
  const { user } = useAuth()

  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const product = useMemo(() => {
    if (!id) return undefined
    const param = decodeURIComponent(id).toLowerCase().trim()
    const byId = products.find((p) => p.id === id || p.id.toLowerCase() === param)
    if (byId) return byId
    const bySlug = products.find((p) => slugify(p.name) === param)
    if (bySlug) return bySlug
    return products.find((p) => param.includes(p.id) || param.includes(slugify(p.name)))
  }, [products, id])

  const { reviews, average, addReview } = useReviews(product?.id || id)

  useEffect(() => {
    if (product?.id) track(product.id)
  }, [product?.id, track])

  const related = useMemo(
    () => products.filter((p) => p.id !== product?.id && p.category_id === product?.category_id).slice(0, 4),
    [products, product],
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="aspect-video w-full max-w-xl" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="text-muted-foreground">{t('common.notFound')}</p>
        <Button asChild className="mt-4 bg-volt text-volt-fg hover:bg-volt-dim">
          <Link to="/shop">{t('common.backHome')}</Link>
        </Button>
      </div>
    )
  }

  const brand = brands.find((b) => b.id === product.brand_id)
  const category = categories.find((c) => c.id === product.category_id)
  const wished = has(product.id)

  const submitReview = async () => {
    if (!user) return
    setSubmitting(true)
    const { error } = await addReview(user.id, rating, comment)
    setSubmitting(false)
    if (error) toast.error(error)
    else {
      toast.success(t('common.saved'))
      setComment('')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-md border border-border bg-secondary">
            {product.images[imgIdx] ? (
              <img src={product.images[imgIdx]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-6xl font-bold text-muted-foreground/30">
                {product.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-16 overflow-hidden rounded border ${i === imgIdx ? 'border-volt' : 'border-border'}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {brand?.name} {category && `· ${category.name}`}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <RatingStars value={average} />
            <span className="text-sm text-muted-foreground">
              {average ? average.toFixed(1) : '—'} ({t('shop.results', { count: reviews.length })})
            </span>
          </div>
          <p className="mt-5 font-display text-3xl font-bold text-volt">{formatPrice(Number(product.price), i18n.language)}</p>
          <div className="mt-2 flex items-center gap-2">
            <StockBadge stock={product.stock} />
            {(Boolean((product as any).is_new) ||
              String(product.specs?.is_new) === 'true' ||
              new Date().getTime() - new Date(product.created_at).getTime() < 14 * 24 * 60 * 60 * 1000) && (
              <span className="rounded bg-volt/15 border border-volt/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-volt shadow-[0_0_8px_rgba(209,166,91,0.2)]">
                {t('badge.newArrival', 'NOUVEL ARRIVAGE')}
              </span>
            )}
          </div>
          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.min(product.stock, qty + 1))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 bg-volt font-bold text-volt-fg hover:bg-volt-dim disabled:opacity-40"
              disabled={product.stock <= 0}
              onClick={() => {
                add(product, qty)
                toast.success(t('product.addedToCart'))
              }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> {t('product.addToCart')}
            </Button>

            <Button
              size="lg"
              variant="outline"
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
              <Heart className={`h-5 w-5 ${wished ? 'fill-volt text-volt' : ''}`} />
            </Button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-volt" /> {t('home.freeShipping')}
          </div>

          {/* Specs */}
          {filterPublicSpecs(product.specs).length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-bold">{t('product.specs')}</h2>
              <dl className="mt-3 divide-y divide-border rounded-md border border-border">
                {filterPublicSpecs(product.specs).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-4 px-4 py-2.5 text-sm">
                    <dt className="font-medium text-muted-foreground uppercase">{k}</dt>
                    <dd className="col-span-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-12" />

      {/* Reviews */}
      <section>
        <h2 className="font-display text-2xl font-bold">{t('product.reviews')}</h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">{t('product.noReviews')}</p>}
            {reviews.map((r) => (
              <div key={r.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{r.author || 'Customer'}</span>
                  <RatingStars value={r.rating} size={3.5} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground/60">{formatDate(r.created_at, i18n.language)}</p>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-border bg-card p-5 h-fit">
            <h3 className="font-display text-base font-bold">{t('product.writeReview')}</h3>
            {user ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-1.5 text-sm text-muted-foreground">{t('product.yourRating')}</p>
                  <RatingStars value={rating} onChange={setRating} size={5} />
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('product.yourComment')}
                  className="bg-secondary"
                  rows={4}
                />
                <Button
                  onClick={submitReview}
                  disabled={submitting || !comment.trim()}
                  className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim"
                >
                  {t('product.submitReview')}
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                <Link to="/auth" className="text-volt hover:underline">{t('nav.signIn')}</Link>{' '}
                {t('product.reviewSignIn')}
              </p>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-bold">{t('product.related')}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
  )
}
