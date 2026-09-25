import { Link } from 'react-router'
import { Apple, Gamepad2, Headphones, ArrowRight } from 'lucide-react'

const HIGHLIGHTS = [
  {
    title: 'Genuine Apple Lineup',
    subtitle: 'Handpicked MacBooks, iPads & iMacs with official warranty.',
    cta: 'Explore Apple',
    link: '/shop?category=univers-apple-mac',
    icon: Apple,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
    color: 'from-stone-900 via-neutral-900 to-black text-white border-stone-800',
  },
  {
    title: 'Comfort = K/D/A Boost',
    subtitle: 'Motorsport-inspired ergonomic gaming chairs built for long sessions.',
    cta: 'Browse Chairs',
    link: '/shop?category=chaises-et-bureaux',
    icon: Gamepad2,
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&q=80',
    color: 'from-slate-900 via-slate-900 to-rose-950/40 text-white border-slate-800',
  },
  {
    title: 'Add the Finishing Touch',
    subtitle: 'High precision mice, mechanical keyboards & immersive headsets.',
    cta: 'See Accessories',
    link: '/shop?category=peripheriques',
    icon: Headphones,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
    color: 'from-slate-900 via-slate-900 to-amber-950/40 text-white border-slate-800',
  },
]

export default function BetaHighlightCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {HIGHLIGHTS.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl ${item.color}`}
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-volt border border-white/20">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="font-display text-xl font-extrabold tracking-tight mt-4">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-white/70 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="h-24 w-28 overflow-hidden rounded-lg bg-black/30 p-1 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-volt px-4 py-2 text-xs font-black uppercase tracking-wider text-volt-fg hover:bg-volt-dim transition-colors"
                >
                  {item.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
