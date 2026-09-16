import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  CircuitBoard,
  Cpu,
  Gamepad2,
  Headphones,
  House,
  Laptop,
  Monitor,
  MousePointer,
  Smartphone,
  Wrench,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useProducts, useCategories } from '@/hooks/useCatalog'
import { useHeroSlides } from '@/hooks/useHeroSlides'
import HeroBubble from '@/components/HeroBubble'
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
  const { activeSlides } = useHeroSlides()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const isCarousel = activeSlides.length > 1

  useEffect(() => {
    if (!isCarousel) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isCarousel, activeSlides.length])

  const safeIndex = currentIndex >= activeSlides.length ? 0 : currentIndex
  const currentSlide = activeSlides[safeIndex] || activeSlides[0]

  const featured = products.filter((p) => p.is_featured).slice(0, 4)
  const rootCategories = categories.filter((c) => !c.parent_id).slice(0, 10)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border min-h-[500px] flex items-center">
        {/* Background Media (Video or Image) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 h-full w-full"
          >
            {currentSlide.type === 'video' ? (
              <video
                key={currentSlide.url}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover opacity-90"
                src={currentSlide.url}
              />
            ) : (
              <img
                src={currentSlide.url}
                alt={currentSlide.titleA || 'Hero Background'}
                className="h-full w-full object-cover opacity-90"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#e5e7eb]/95 via-[#e5e7eb]/70 to-transparent dark:from-background/90 dark:via-background/50" />
        <div className="bg-grid absolute inset-0 opacity-20 pointer-events-none" />
        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-volt/10 blur-[100px]" />
        <div className="absolute -right-24 top-10 h-60 w-60 rounded-full bg-volt/5 blur-[80px]" />

        {/* Hero Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Speech Bubble Overlay */}
              {currentSlide.bubbleText && (
                <div className="mb-4">
                  <HeroBubble text={currentSlide.bubbleText} />
                </div>
              )}

              {/* Badge */}
              <span className="inline-block border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-volt">
                {currentSlide.badge || t('home.heroBadge')}
              </span>

              {/* Title */}
              <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                {currentSlide.titleA || t('home.heroTitleA')}
                <br />
                <span className="text-volt">{currentSlide.titleB || t('home.heroTitleB')}</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
                {currentSlide.sub || t('home.heroSub')}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={currentSlide.ctaLink || '/shop'}
                  className="inline-flex items-center gap-2 bg-volt px-6 py-3 text-sm font-bold uppercase tracking-wide text-volt-fg transition-colors hover:bg-volt-dim"
                >
                  {currentSlide.ctaText || t('home.shopNow')} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/deals"
                  className="inline-flex items-center gap-2 border border-volt/60 bg-volt/10 px-6 py-3 text-sm font-bold uppercase tracking-wide text-volt transition-colors hover:bg-volt hover:text-volt-fg"
                >
                  <Zap className="h-4 w-4" /> Deals & Offers
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation Controls (Only if multiple items exist) */}
        {isCarousel && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Hero Slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-md text-foreground transition-all hover:bg-volt hover:text-volt-fg hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next Hero Slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-md text-foreground transition-all hover:bg-volt hover:text-volt-fg hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Carousel Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {activeSlides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 transition-all rounded-full ${
                    idx === safeIndex ? 'w-8 bg-volt' : 'w-2.5 bg-foreground/30 hover:bg-foreground/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <BrandCarousel />

      <DealOfDay />

      <OffersCollection />

      {/* Featured Products */}
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
