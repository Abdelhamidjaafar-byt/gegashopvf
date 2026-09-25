import { Link } from 'react-router'
import { Apple, ArrowRight, ShieldCheck } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { useTranslation } from 'react-i18next'

const APPLE_PRODUCTS = [
  {
    id: 'app-1',
    name: 'MacBook Pro 16" M3 Max 36GB / 1TB SSD',
    category: 'Laptops',
    specs: 'M3 Max 16-core CPU, 40-core GPU, 36GB Unified Memory, 16.2" Liquid Retina XDR',
    price: 34990,
    oldPrice: 38500,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
    badge: 'M3 MAX',
  },
  {
    id: 'app-2',
    name: 'MacBook Air 15" M2 8GB / 256GB SSD',
    category: 'Laptops',
    specs: 'Apple M2 Chip, 15.3" Liquid Retina, 18h Battery, Ultra-Slim Aluminum',
    price: 13990,
    oldPrice: 15490,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&q=80',
    badge: 'POPULAR',
  },
  {
    id: 'app-3',
    name: 'iPad Air 11" M2 WiFi 128GB Space Gray',
    category: 'Tablets',
    specs: 'Apple M2 Chip, Liquid Retina Display, 12MP Ultra-Wide Front Camera',
    price: 7890,
    oldPrice: 8690,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80',
    badge: 'NEW',
  },
  {
    id: 'app-4',
    name: 'iMac 24" M3 8-Core CPU 10-Core GPU 8GB 256GB',
    category: 'Desktops',
    specs: 'Apple M3 Chip, 4.5K Retina Display, Magic Keyboard & Mouse included',
    price: 16490,
    oldPrice: 17990,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
    badge: 'OFFICE PRO',
  },
]

export default function BetaAppleSpotlight() {
  const { i18n } = useTranslation()

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-900 p-6 md:p-10 text-white shadow-2xl">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-blue-600/10 blur-[90px] pointer-events-none" />

        {/* Section Title */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-purple-500/20 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-purple-300">
              <Apple className="h-4 w-4 text-purple-300" /> Authorized Quality & Original Gear
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-black text-white tracking-tight">
              Hand Picked Apple Lineup
            </h2>
            <p className="mt-1 text-sm text-purple-200/80 max-w-2xl">
              Authentic MacBooks, iPads & Desktops with official warranty, fast delivery & expert setup in Morocco.
            </p>
          </div>

          <Link
            to="/shop?category=univers-apple-mac"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
          >
            Explore All Apple <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Apple Product Grid */}
        <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {APPLE_PRODUCTS.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-xl border border-purple-500/20 bg-slate-900/80 p-5 backdrop-blur transition-all hover:border-purple-400/60 hover:bg-slate-900 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                    {item.badge}
                  </span>
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                </div>

                <div className="my-4 flex items-center justify-center h-40 bg-slate-950/50 rounded-lg p-3 border border-purple-500/10">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-32 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                  {item.name}
                </h3>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.specs}
                </p>
              </div>

              <div className="mt-5 border-t border-purple-500/20 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 line-through block">
                    {formatPrice(item.oldPrice, i18n.language)}
                  </span>
                  <span className="font-display text-base font-black text-volt">
                    {formatPrice(item.price, i18n.language)}
                  </span>
                </div>

                <Link
                  to={`/shop?q=${encodeURIComponent(item.name.split(' ')[0])}`}
                  className="rounded-lg bg-volt px-3 py-1.5 text-xs font-extrabold text-volt-fg hover:bg-volt-dim transition-colors"
                >
                  Order
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
