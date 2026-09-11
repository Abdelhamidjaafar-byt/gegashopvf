import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight, Zap } from 'lucide-react'
import { useProducts } from '@/hooks/useCatalog'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types'

// Deal of the Day — the featured deal product with a live countdown to midnight.
// Matches live DB id first, falls back to the demo-mode id.
const DEAL_PRODUCT_IDS = ['d1000000-0000-4000-8000-000000000005', 'p5']
const DISCOUNT = 0.25

function msUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

function useCountdown() {
  const [ms, setMs] = useState(msUntilMidnight)
  useEffect(() => {
    const timer = setInterval(() => setMs(msUntilMidnight()), 1000)
    return () => clearInterval(timer)
  }, [])
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
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
  const { h, m, s } = useCountdown()

  const product: Product | undefined = useMemo(
    () => products.find((p) => DEAL_PRODUCT_IDS.includes(p.id)),
    [products],
  )
  if (!product) return null

  const dealPrice = Math.round(Number(product.price) * (1 - DISCOUNT))
  const soldPct = 68

  return (
    <section className="border-y border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-lg border border-volt/30 bg-background"
        >
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-volt/10 blur-[80px]" />
          <div className="relative grid gap-8 p-6 md:grid-cols-2 md:p-10">
            {/* Info */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-1.5 border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-volt">
                <Zap className="h-3.5 w-3.5" /> {t('deal.badge')}
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">{product.name}</h2>
              <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted-foreground">{product.description}</p>

              <div className="mt-5 flex items-end gap-3">
                <span className="font-display text-4xl font-bold text-volt">{formatPrice(dealPrice, i18n.language)}</span>
                <span className="pb-1 text-lg text-muted-foreground line-through">
                  {formatPrice(Number(product.price), i18n.language)}
                </span>
                <span className="mb-1 rounded-sm bg-volt px-2 py-0.5 text-xs font-bold text-volt-fg">
                  -{Math.round(DISCOUNT * 100)}%
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
                to={`/product/${product.id}`}
                className="mt-7 inline-flex w-fit items-center gap-2 bg-volt px-6 py-3 text-sm font-bold uppercase tracking-wide text-volt-fg transition-colors hover:bg-volt-dim"
              >
                {t('deal.cta')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Product image */}
            <Link to={`/product/${product.id}`} className="group relative flex items-center justify-center">
              <div className="absolute h-48 w-48 rounded-full bg-volt/15 blur-[70px] transition-opacity group-hover:opacity-100 md:h-64 md:w-64" />
              <motion.img
                src={product.images[0]}
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
