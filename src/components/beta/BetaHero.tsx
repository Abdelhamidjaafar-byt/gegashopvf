import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  Flame,
  ArrowRight,
  Cpu,
  Laptop,
  Monitor,
  Apple,
  Gamepad2,
  HardDrive,
  Headphones,
  Sliders,
  Sparkles
} from 'lucide-react'
import { useProducts } from '@/hooks/useCatalog'
import { useOffers } from '@/hooks/useOffers'
import { useHeroSlides } from '@/hooks/useHeroSlides'
import { formatPrice } from '@/lib/format'
import { useTranslation } from 'react-i18next'

function useCountdown(targetIso?: string) {
  const getMs = () => {
    if (!targetIso) {
      const now = new Date()
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      return end.getTime() - now.getTime()
    }
    return Math.max(0, new Date(targetIso).getTime() - Date.now())
  }

  const [ms, setMs] = useState(getMs)

  useEffect(() => {
    setMs(getMs())
    const interval = setInterval(() => setMs(getMs()), 1000)
    return () => clearInterval(interval)
  }, [targetIso])

  const totalSec = Math.floor(ms / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  return { d, h, m, s }
}

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'ULTIMATE PERFORMANCE',
    title: 'THE NEW MacBook Pro M4',
    subtitle: 'Now available with M4 Pro & M4 Max chips. Next-gen graphics, 24h battery life & Liquid Retina XDR display.',
    price: '22,900.00 MAD',
    oldPrice: '25,490.00 MAD',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    link: '/shop?category=laptops',
    badge: 'NEW ARRIVAL',
  },
  {
    id: 2,
    tag: 'CUSTOM GAMING PC',
    title: 'ELECTRO BEAST RTX 4080 SUPER',
    subtitle: 'Intel Core i9 14900KF | 32GB DDR5 RGB | 2TB NVMe Gen4 SSD | 360mm AIO Liquid Cooling | Glass Aquarium Case.',
    price: '29,990.00 MAD',
    oldPrice: '32,900.00 MAD',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
    link: '/builder',
    badge: 'PRO BUILD',
  },
  {
    id: 3,
    tag: 'PRO GAMING GEAR',
    title: 'ASUS ROG Swift 240Hz OLED',
    subtitle: '0.03ms Response time, G-SYNC compatible, HDR1000 & 99% DCI-P3 color gamut for maximum competitive edge.',
    price: '9,490.00 MAD',
    oldPrice: '10,990.00 MAD',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    link: '/shop?category=displays-tv',
    badge: 'BESTSELLER',
  },
]

const QUICK_CATEGORIES = [
  { name: 'PC Gamer', icon: Cpu, link: '/shop?category=pc-gamer', color: 'from-amber-500/20 to-orange-500/10 text-amber-500' },
  { name: 'Laptops', icon: Laptop, link: '/shop?category=laptops', color: 'from-blue-500/20 to-cyan-500/10 text-blue-500' },
  { name: 'Monitors', icon: Monitor, link: '/shop?category=displays-tv', color: 'from-purple-500/20 to-indigo-500/10 text-purple-400' },
  { name: 'Apple', icon: Apple, link: '/shop?q=Apple', color: 'from-neutral-500/20 to-stone-500/10 text-foreground' },
  { name: 'Components', icon: Sliders, link: '/shop?category=composants', color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400' },
  { name: 'Gaming Chairs', icon: Gamepad2, link: '/shop?q=Chair', color: 'from-rose-500/20 to-pink-500/10 text-rose-400' },
  { name: 'Storage', icon: HardDrive, link: '/shop?q=SSD', color: 'from-sky-500/20 to-blue-500/10 text-sky-400' },
  { name: 'Peripherals', icon: Headphones, link: '/shop?category=peripheriques', color: 'from-yellow-500/20 to-amber-500/10 text-yellow-400' },
]

export default function BetaHero() {
  const { i18n } = useTranslation()
  const { products } = useProducts()
  const { offers } = useOffers()
  const { activeSlides: adminSlides } = useHeroSlides()
  const [activeSlideIdx, setActiveSlideIdx] = useState(0)

  // Dynamic slides combining admin-uploaded slides and latest 3 DB products
  const heroSlides = useMemo(() => {
    const list: Array<{
      id: string | number
      tag: string
      title: string
      subtitle: string
      price?: string
      oldPrice?: string
      image: string
      link: string
      badge: string
    }> = []

    // 1. Add active custom slides uploaded by admin
    if (adminSlides && adminSlides.length > 0) {
      adminSlides.forEach((slide) => {
        if (slide.url && slide.url !== 'hero.mp4') {
          list.push({
            id: slide.id,
            tag: slide.badge || 'SPECIAL ANNOUNCEMENT',
            title: slide.titleA ? `${slide.titleA} ${slide.titleB || ''}` : (slide.titleB || 'Featured Deal'),
            subtitle: slide.sub || '',
            image: slide.url,
            link: slide.ctaLink || '/shop',
            badge: slide.badge || 'PROMO',
          })
        }
      })
    }

    // 2. Add the last 3 products from database catalog
    const latest3 = products.slice(0, 3)
    latest3.forEach((p, idx) => {
      list.push({
        id: `db-prod-${p.id}`,
        tag: p.brand_id ? p.brand_id.toUpperCase() : 'NEW ARRIVAL',
        title: p.name,
        subtitle: p.description || 'Authentic tech gear & gaming setups delivered anywhere in Morocco with official warranty.',
        price: formatPrice(p.price, i18n.language),
        oldPrice: formatPrice(p.price * 1.15, i18n.language),
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
        link: `/product/${p.id}`,
        badge: p.is_featured ? 'FEATURED' : idx === 0 ? 'NEW ARRIVAL' : 'TOP PICK',
      })
    })

    // 3. Fallback to default slides if list is empty
    if (list.length === 0) {
      return HERO_SLIDES
    }

    return list
  }, [adminSlides, products, i18n.language])

  // Auto carousel slide
  useEffect(() => {
    if (heroSlides.length === 0) return
    const timer = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  // Active flash deal
  const flashOffer = useMemo(() => {
    return offers.find((o) => o.is_active && o.is_deal_of_day) || offers[0]
  }, [offers])

  const flashProduct = useMemo(() => {
    if (flashOffer?.product) return flashOffer.product
    if (flashOffer?.product_id) return products.find((p) => p.id === flashOffer.product_id)
    return products[0]
  }, [flashOffer, products])

  const { d, h, m, s } = useCountdown(flashOffer?.end_time)

  const currentSlide = heroSlides[activeSlideIdx % heroSlides.length] || heroSlides[0]

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* ============================================================ */}
        {/* CARD 1: FLASH SALE DEAL OF THE DAY (LEFT - 3 COLS ON LG) */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 flex flex-col justify-between overflow-hidden rounded-xl border border-volt/30 bg-card/90 p-5 shadow-lg relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-volt/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-volt/15 border border-volt/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-volt">
                <Flame className="h-3.5 w-3.5 fill-volt animate-bounce" /> Flash Sale
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Offer of Day
              </span>
            </div>

            {/* Product Image & Discount Tag */}
            <div className="relative mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-secondary/40 p-3">
              <span className="absolute top-2 left-2 z-10 rounded-md bg-volt px-2 py-1 text-xs font-black text-volt-fg shadow-md">
                -{flashOffer?.discount_percent || 20}% OFF
              </span>

              {flashProduct?.images?.[0] ? (
                <img
                  src={flashProduct.images[0]}
                  alt={flashProduct.name}
                  className="max-h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80"
                  alt="Flash Deal"
                  className="max-h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>

            {/* Title & Desc */}
            <div className="mt-3">
              <h3 className="font-bold text-sm line-clamp-2 hover:text-volt transition-colors">
                {flashOffer?.title || flashProduct?.name || 'PC Gamer Intel Core i7 13700F + RTX 4070'}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {flashOffer?.description || flashProduct?.description || 'High speed gaming workstation with DDR5 RAM & NVMe SSD.'}
              </p>
            </div>

            {/* Price tag */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-xl font-extrabold text-volt">
                {formatPrice(flashOffer?.discounted_price || flashProduct?.price || 12490, i18n.language)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice((flashOffer?.discounted_price || 12490) * 1.25, i18n.language)}
              </span>
            </div>

            {/* Countdown Box */}
            <div className="mt-4 rounded-lg border border-border/80 bg-secondary/50 p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center mb-1.5">
                Time Remaining:
              </div>
              <div className="grid grid-cols-4 gap-1 text-center font-mono font-bold text-xs">
                <div className="bg-background rounded border border-border/60 py-1">
                  <span className="text-volt text-sm">{String(d).padStart(2, '0')}</span>
                  <div className="text-[9px] text-muted-foreground font-sans">Days</div>
                </div>
                <div className="bg-background rounded border border-border/60 py-1">
                  <span className="text-volt text-sm">{String(h).padStart(2, '0')}</span>
                  <div className="text-[9px] text-muted-foreground font-sans">Hrs</div>
                </div>
                <div className="bg-background rounded border border-border/60 py-1">
                  <span className="text-volt text-sm">{String(m).padStart(2, '0')}</span>
                  <div className="text-[9px] text-muted-foreground font-sans">Min</div>
                </div>
                <div className="bg-background rounded border border-border/60 py-1">
                  <span className="text-volt text-sm">{String(s).padStart(2, '0')}</span>
                  <div className="text-[9px] text-muted-foreground font-sans">Sec</div>
                </div>
              </div>
            </div>

            {/* Stock Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground mb-1">
                <span>Sold: {flashOffer?.claimed_percentage || 74}%</span>
                <span className="text-volt font-bold">Limited Stock!</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-volt rounded-full transition-all duration-700"
                  style={{ width: `${flashOffer?.claimed_percentage || 74}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            to={flashProduct ? `/product/${flashProduct.id}` : '/deals'}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-volt py-2.5 text-xs font-extrabold uppercase tracking-wide text-volt-fg transition-all hover:bg-volt-dim hover:shadow-md"
          >
            Get Deal Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* ============================================================ */}
        {/* CARD 2: MAIN HERO BANNER CAROUSEL (CENTER - 6 COLS ON LG) */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-950 via-neutral-900 to-black p-6 md:p-8 min-h-[380px] text-white shadow-xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-0"
            >
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="h-full w-full object-cover opacity-70 filter brightness-105 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              {/* <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" /> */}
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-volt/20 border border-volt/40 px-2.5 py-0.5 text-xs font-bold text-volt">
                  <Sparkles className="h-3 w-3" /> {currentSlide.badge}
                </span>
                {/* <span className="text-xs font-semibold uppercase tracking-widest text-zinc-300">
                  {currentSlide.tag}
                </span> */}
              </div>

              <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
                {currentSlide.title}
              </h1>

              <p className="mt-3 max-w-lg text-sm text-zinc-300 md:text-base line-clamp-3 leading-relaxed">
                {currentSlide.subtitle}
              </p>

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                {currentSlide.price && (
                  <span className="font-display text-2xl md:text-3xl font-extrabold text-volt">
                    {currentSlide.price}
                  </span>
                )}
                {currentSlide.oldPrice && (
                  <span className="text-sm text-zinc-400 line-through">
                    {currentSlide.oldPrice}
                  </span>
                )}
                <span className="rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold">
                  Free Shipping Morocco
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-3">
                <Link
                  to={currentSlide.link}
                  className="inline-flex items-center gap-2 rounded-lg bg-volt px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-volt-fg transition-all hover:bg-volt-dim hover:scale-105 shadow-md"
                >
                  Discover <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/builder"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                >
                  <Sliders className="h-3.5 w-3.5 text-volt" /> PC Builder
                </Link>
              </div>

              {/* Carousel Indicators */}
              <div className="flex items-center gap-2">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIdx(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-2 transition-all rounded-full ${idx === activeSlideIdx ? 'w-6 bg-volt' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD 3 & 4: RIGHT SIDE (3 COLS ON LG: CATEGORY CIRCLES + PICK OF WEEK) */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* QUICK CATEGORY CIRCLES GRID */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-volt" /> Hot Categories
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              {QUICK_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon
                return (
                  <Link
                    key={i}
                    to={cat.link}
                    className="group flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-secondary transition-all"
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${cat.color} border border-border/50 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold leading-tight text-muted-foreground group-hover:text-foreground line-clamp-1">
                      {cat.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* BEST PICK OF THE WEEK CARD */}
          <div className="flex-1 rounded-xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-2 right-2 rounded-full bg-volt/20 px-2 py-0.5 text-[10px] font-black uppercase text-volt border border-volt/30">
              BEST PICK
            </div>

            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                PC GAMER SPECIAL
              </span>
              <h4 className="font-bold text-sm mt-1 group-hover:text-volt transition-colors line-clamp-1">
                PC GAMER INTEL i5 12400F + RTX 4060
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                16GB DDR4 3200MHz | 1TB NVMe M.2 SSD | 650W Bronze PSU | Tempered Glass Case
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground line-through block">9,990.00 MAD</span>
                <span className="font-display text-lg font-extrabold text-volt">8,490.00 MAD</span>
              </div>
              <Link
                to="/shop?category=pc-gamer"
                className="rounded-md bg-volt/10 border border-volt/40 px-3 py-1.5 text-xs font-bold text-volt hover:bg-volt hover:text-volt-fg transition-all"
              >
                Configure
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
