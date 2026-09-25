import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight, Zap } from 'lucide-react'
import { useProducts } from '@/hooks/useCatalog'
import { useOffers } from '@/hooks/useOffers'
import { formatPrice, getProductUrl } from '@/lib/format'
import type { Product, Offer } from '@/types'

const DEFAULT_DEAL_IDS = ['d1000000-0000-4000-8000-000000000005', 'p5']

function msUntilTarget(targetIso?: string): number {
  if (!targetIso) {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    return midnight.getTime() - now.getTime()
  }
  return new Date(targetIso).getTime() - Date.now()
}

function useCountdown(targetIso?: string) {
  const [ms, setMs] = useState(() => msUntilTarget(targetIso))

  useEffect(() => {
    setMs(msUntilTarget(targetIso))
    const timer = setInterval(() => setMs(msUntilTarget(targetIso)), 1000)
    return () => clearInterval(timer)
  }, [targetIso])

  const totalSec = Math.max(0, Math.floor(ms / 1000))
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
    isExpired: totalSec <= 0,
  }
}

function TimeCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-14 rounded-md border border-volt/40 bg-background/80 px-2 py-1.5 text-center font-display text-2xl font-bold tabular-nums text-volt">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  )
}

export default function DealOfDay() {
  const { t, i18n } = useTranslation()
  const { products } = useProducts()
  const { offers } = useOffers()

  // Find active deal of the day from admin offers or active offers
  const activeOffer: Offer | undefined = useMemo(() => {
    const active = offers.filter((o) => o.is_active && new Date(o.end_time).getTime() > Date.now())
    return active.find((o) => o.is_deal_of_day) || active[0]
  }, [offers])

  const product: Product | undefined = useMemo(() => {
    if (activeOffer) {
      const found = products.find((p) => p.id === activeOffer.product_id)
      if (found) return found
    }
    return products.find((p) => DEFAULT_DEAL_IDS.includes(p.id)) || products[0]
  }, [activeOffer, products])

  const { h, m, s } = useCountdown(activeOffer?.end_time)

  if (!product) return null

  const discountPercent = activeOffer ? activeOffer.discount_percent : 25
  const dealPrice = activeOffer?.discounted_price
    ? activeOffer.discounted_price
    : Math.round(Number(product.price) * (1 - discountPercent / 100))
  const soldPct = activeOffer ? activeOffer.claimed_percentage : 68
  const badgeText = activeOffer ? activeOffer.badge : t('deal.badge')
  const offerTitle = activeOffer ? activeOffer.title : product.name
  const offerDesc = activeOffer?.description || product.description

  return (
    <section className="border-y border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-lg border border-volt/30 bg-background shadow-xl"
        >
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-volt/10 blur-[80px]" />
          <div className="relative grid gap-8 p-6 md:grid-cols-2 md:p-10">
            {/* Info */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-1.5 border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-volt">
                <Zap className="h-3.5 w-3.5" /> {badgeText}
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">{offerTitle}</h2>
              <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted-foreground">{offerDesc}</p>

              <div className="mt-5 flex items-end gap-3">
                <span className="font-display text-4xl font-bold text-volt">{formatPrice(dealPrice, i18n.language)}</span>
                <span className="pb-1 text-lg text-muted-foreground line-through">
                  {formatPrice(Number(product.price), i18n.language)}
                </span>
                <span className="mb-1 rounded-sm bg-volt px-2 py-0.5 text-xs font-bold text-volt-fg">
                  -{discountPercent}%
                </span>
              </div>

              {/* Countdown */}
              <div className="mt-6 flex items-center gap-3">
                <TimeCell value={h} label={t('deal.hours')} />
                <span className="pb-4 font-display text-2xl font-bold text-volt">:</span>
                <TimeCell value={m} label={t('deal.minutes')} />
                <span className="pb-4 font-display text-2xl font-bold text-volt">:</span>
                <TimeCell value={s} label={t('deal.seconds')} />
              </div>

              {/* Stock urgency */}
              <div className="mt-6 max-w-sm">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('deal.claimed', { pct: soldPct })}</span>
                  <span className="font-semibold text-volt">{t('deal.hurry')}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-volt"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${soldPct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <Link
                to={getProductUrl(product)}
                className="mt-7 inline-flex w-fit items-center gap-2 bg-volt px-6 py-3 text-sm font-bold uppercase tracking-wide text-volt-fg transition-colors hover:bg-volt-dim"
              >
                {t('deal.cta')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Product image */}
            <Link to={getProductUrl(product)} className="group relative flex items-center justify-center">
              <div className="absolute h-48 w-48 rounded-full bg-volt/15 blur-[70px] transition-opacity group-hover:opacity-100 md:h-64 md:w-64" />
              <motion.img
                src={product.images && product.images[0] ? product.images[0] : ''}
                alt={product.name}
                className="relative max-h-72 w-auto rounded-md object-contain transition-transform duration-500 group-hover:scale-105"
                initial={{ opacity: 0, rotate: -3, scale: 0.9 }}
                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
