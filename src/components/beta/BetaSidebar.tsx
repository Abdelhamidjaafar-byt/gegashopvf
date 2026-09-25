import { Link } from 'react-router'
import { Flame, Headphones, BookOpen, Clock } from 'lucide-react'
import { useProducts } from '@/hooks/useCatalog'
import { formatPrice, getProductUrl } from '@/lib/format'
import { useTranslation } from 'react-i18next'

const TECH_ARTICLES = [
  {
    id: 1,
    title: 'How to Choose a Gaming PC in Morocco: GPU, CPU & RAM Guide',
    date: 'Jan 18, 2025',
    category: 'PC Building',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&q=80',
  },
  {
    id: 2,
    title: 'Intel Core i7/i9 vs AMD Ryzen 7 7800X3D: Which is Best for Gaming?',
    date: 'Dec 22, 2024',
    category: 'Hardware',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80',
  },
  {
    id: 3,
    title: 'Mechanical Keyboards & High Refresh Monitors Explained',
    date: 'Nov 14, 2024',
    category: 'Peripherals',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80',
  },
]

export default function BetaSidebar() {
  const { i18n } = useTranslation()
  const { products } = useProducts()

  const accessories = products
    .filter((p) => p.category_id === 'peripheriques' || p.category_id === 'audio' || p.price < 2000)
    .slice(0, 3)

  return (
    <aside className="space-y-6">

      {/* 1. FEATURED AUDIO BANNER (JBL / HIGH-END PROMO) */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-violet-950/80 via-slate-900 to-black p-5 text-white shadow-lg">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/20 border border-purple-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
          <Headphones className="h-3 w-3 text-purple-400" /> Audio Spotlight
        </span>

        <h3 className="mt-3 font-display text-lg font-black leading-tight text-white">
          JBL TUNE FLEX TWS
        </h3>

        <p className="mt-1 text-xs text-purple-200/80 leading-relaxed">
          Active Noise Cancelling, Pure Bass Sound, 32 Hours Battery & Water Resistant.
        </p>

        <div className="my-3 flex items-center justify-center py-2">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
            alt="JBL Tune Flex"
            className="h-28 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform"
          />
        </div>

        <div className="flex items-center justify-between border-t border-purple-500/20 pt-3">
          <div>
            <span className="text-[10px] text-purple-300 block line-through">1,190.00 MAD</span>
            <span className="font-display text-base font-extrabold text-volt">890.00 MAD</span>
          </div>
          <Link
            to="/shop?q=JBL"
            className="rounded-lg bg-volt px-3 py-1.5 text-xs font-bold text-volt-fg hover:bg-volt-dim transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* 2. TRENDING ACCESSORIES & QUICK VIEW WIDGET */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-volt" /> Top Peripherals & Gear
        </h3>

        <div className="divide-y divide-border/60">
          {(accessories.length > 0 ? accessories : products.slice(0, 3)).map((item) => (
            <Link
              key={item.id}
              to={getProductUrl(item)}
              className="flex items-center gap-3 py-3 group hover:bg-secondary/40 px-1 rounded-lg transition-colors"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary/50 p-1 flex items-center justify-center border border-border/40">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=80'}
                  alt={item.name}
                  className="h-full w-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-volt transition-colors">
                  {item.name}
                </h4>
                <p className="text-xs font-extrabold text-volt mt-0.5">
                  {formatPrice(item.price, i18n.language)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. TECH GUIDES & ARTICLES BLOG WIDGET */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-volt" /> ElectroGega Tech Guides
        </h3>

        <div className="space-y-3">
          {TECH_ARTICLES.map((article) => (
            <div
              key={article.id}
              className="flex gap-3 group cursor-pointer border-b border-border/40 pb-3 last:border-0 last:pb-0"
            >
              <img
                src={article.image}
                alt={article.title}
                className="h-14 w-14 shrink-0 rounded-lg object-cover border border-border/60 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-volt uppercase tracking-wider">
                  {article.category}
                </span>
                <h4 className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-volt transition-colors mt-0.5 leading-snug">
                  {article.title}
                </h4>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" /> {article.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}
