import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight, CircuitBoard, Cpu, Gamepad2, Headphones, House, Laptop, Monitor, MousePointer, Smartphone, Wrench, Zap } from 'lucide-react'
import { useProducts, useCategories } from '@/hooks/useCatalog'
import ProductCard from '@/components/ProductCard'
import BrandCarousel from '@/components/BrandCarousel'
import DealOfDay from '@/components/DealOfDay'
import OffersCollection from '@/components/OffersCollection'
import { Skeleton } from '@/components/ui/skeleton'


const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphones: Smartphone,
  laptops: Laptop,
  audio: Headphones,
  gaming: Gamepad2,
  'displays-tv': Monitor,
  accessories: MousePointer,
  'pc-gamer': Cpu,
  composants: CircuitBoard,
  peripheriques: MousePointer,
  'smart-home': House,
}

export default function HomePage() {
  const { t } = useTranslation()
  const { products, loading } = useProducts()
  const { categories } = useCategories()
  const featured = products.filter((p) => p.is_featured).slice(0, 4)
  const rootCategories = categories.filter((c) => !c.parent_id).slice(0, 10)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          src="hero.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#e5e7eb]/90 via-[#e5e7eb]/60 to-transparent dark:from-background/80 dark:via-background/40" />
        <div className="bg-grid absolute inset-0 opacity-20 pointer-events-none" />
        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-volt/10 blur-[100px]" />
        <div className="absolute -right-24 top-10 h-60 w-60 rounded-full bg-volt/5 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-volt">
              {t('home.heroBadge')}
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              {t('home.heroTitleA')}
              <br />
              <span className="text-volt">{t('home.heroTitleB')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">{t('home.heroSub')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-volt px-6 py-3 text-sm font-bold uppercase tracking-wide text-volt-fg transition-colors hover:bg-volt-dim"
              >
                {t('home.shopNow')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/deals"
                className="inline-flex items-center gap-2 border border-volt/60 bg-volt/10 px-6 py-3 text-sm font-bold uppercase tracking-wide text-volt transition-colors hover:bg-volt hover:text-volt-fg"
              >
                <Zap className="h-4 w-4" /> Deals & Offers
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <BrandCarousel />

      <DealOfDay />

      <OffersCollection />

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">{t('home.featured')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('home.featuredSub')}</p>
          </div>
          <Link to="/shop" className="hidden items-center gap-1 text-sm font-semibold text-volt hover:underline sm:inline-flex">
            {t('home.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full" />)
            : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* PC Builder CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-lg border border-border bg-card p-8 md:flex-row md:items-center md:p-10"
        >
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-volt/10 blur-[70px]" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-volt">
              <Wrench className="h-3.5 w-3.5" /> {t('builder.badge')}
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">{t('builder.ctaTitle')}</h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">{t('builder.ctaSub')}</p>
          </div>
          <Link
            to="/builder"
            className="relative inline-flex shrink-0 items-center gap-2 bg-volt px-6 py-3 text-sm font-bold uppercase tracking-wide text-volt-fg transition-colors hover:bg-volt-dim"
          >
            {t('builder.ctaButton')} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold md:text-3xl">{t('home.browseCategories')}</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {rootCategories.map((c, i) => {
            const Icon = categoryIcons[c.slug] || Smartphone
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/shop?category=${c.id}`}
                  className="flex h-full flex-col items-center gap-3 rounded-md border border-border bg-card p-6 text-center transition-colors hover:border-volt/60 hover:bg-secondary"
                >
                  <Icon className="h-7 w-7 text-volt" />
                  <span className="text-sm font-semibold">{c.name}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
