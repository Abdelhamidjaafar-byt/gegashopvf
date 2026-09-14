import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight, ShoppingCart, Timer, Zap, Flame } from 'lucide-react'
import { useOffers } from '@/hooks/useOffers'
import { useProducts } from '@/hooks/useCatalog'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

function OfferCountdown({ targetIso }: { targetIso: string }) {
  const [ms, setMs] = useState(() => Math.max(0, new Date(targetIso).getTime() - Date.now()))

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, new Date(targetIso).getTime() - Date.now())
      setMs(remaining)
    }, 1000)
    return () => clearInterval(timer)
  }, [targetIso])

  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-volt">
      <Timer className="h-3.5 w-3.5 animate-pulse" />
      <span>
        {String(h).padStart(2, '0')}h {String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
      </span>
    </div>
  )
}

export default function OffersCollection({ limit }: { limit?: number }) {
  const { i18n } = useTranslation()
  const { offers } = useOffers()
  const { products } = useProducts()
  const { add } = useCart()

  // Filter active valid offers
  const activeOffers = useMemo(() => {
    const valid = offers.filter(
      (o) => o.is_active && new Date(o.end_time).getTime() > Date.now()
    )
    return limit ? valid.slice(0, limit) : valid
  }, [offers, limit])

  if (activeOffers.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-volt">
            <Flame className="h-4 w-4 fill-volt" /> Live Deals & Flash Sales
          </span>
          <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">
            Limited Time Offers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Grab these exclusive discounts before the countdown timer hits zero!
          </p>
        </div>

        <Link
          to="/deals"
          className="hidden items-center gap-1 text-sm font-semibold text-volt hover:underline sm:inline-flex"
        >
          View All Offers ({offers.filter((o) => o.is_active).length}) <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Offers Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeOffers.map((offer, index) => {
          const product: Product | undefined =
            offer.product || products.find((p) => p.id === offer.product_id)

          if (!product) return null

          const origPrice = Number(product.price)
          const dealPrice =
            offer.discounted_price || Math.round(origPrice * (1 - offer.discount_percent / 100))

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card p-5 transition-all hover:border-volt/60 hover:shadow-lg"
            >
              {/* Badge & Timer Header */}
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                <Badge className="bg-volt/10 text-volt border-volt/30 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5">
                  <Zap className="mr-1 h-3 w-3" /> {offer.badge}
                </Badge>
                <OfferCountdown targetIso={offer.end_time} />
              </div>

              {/* Product Image & Discount Tag */}
              <div className="relative mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-secondary/30 p-4">
                <span className="absolute left-2 top-2 z-10 rounded-sm bg-volt px-2 py-0.5 font-display text-xs font-bold text-volt-fg">
                  -{offer.discount_percent}% OFF
                </span>

                <img
                  src={product.images && product.images[0] ? product.images[0] : ''}
                  alt={product.name}
                  className="max-h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Details */}
              <div className="mt-4 flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base line-clamp-1 group-hover:text-volt transition-colors">
                    {offer.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {offer.description || product.description}
                  </p>
                </div>

                {/* Claimed Urgency Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1 font-medium">
                    <span>{offer.claimed_percentage}% claimed</span>
                    <span className="text-volt">Hurry, limited stock!</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-volt rounded-full transition-all duration-500"
                      style={{ width: `${offer.claimed_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Price & Action */}
                <div className="mt-5 flex items-center justify-between border-t border-border/80 pt-3">
                  <div>
                    <div className="font-display text-xl font-bold text-volt">
                      {formatPrice(dealPrice, i18n.language)}
                    </div>
                    <div className="text-xs text-muted-foreground line-through">
                      {formatPrice(origPrice, i18n.language)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => add(product)}
                      className="bg-volt text-volt-fg hover:bg-volt-dim font-bold text-xs"
                    >
                      <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
