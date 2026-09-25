import { Link } from 'react-router'
import { Cpu, Laptop, Monitor, Apple, Gamepad2, Sliders, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    name: 'PC Gamer Setups',
    subtitle: 'Pre-built & Custom Rig Towers',
    icon: Cpu,
    link: '/shop?category=pc-gamer',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  },
  {
    name: 'Components & GPUs',
    subtitle: 'Nvidia RTX, AMD, Motherboards, RAM',
    icon: Sliders,
    link: '/shop?category=composants',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
  },
  {
    name: 'Gaming Laptops',
    subtitle: 'Asus ROG, MSI, Lenovo Legion',
    icon: Laptop,
    link: '/shop?category=laptops',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  },
  {
    name: 'Monitors & Displays',
    subtitle: '144Hz, 240Hz, 4K & Curved Gaming',
    icon: Monitor,
    link: '/shop?category=displays-tv',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
  },
  {
    name: 'Apple Lineup',
    subtitle: 'MacBook Pro, Air, iPad & iMac',
    icon: Apple,
    link: '/shop?category=univers-apple-mac',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    color: 'from-stone-500/20 to-neutral-500/10 border-stone-500/30',
  },
  {
    name: 'Chairs & Ergonomics',
    subtitle: 'Corsair T3, Noblechairs & Desk Setups',
    icon: Gamepad2,
    link: '/shop?category=chaises-et-bureaux',
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&q=80',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
  },
]

export default function BetaCategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between border-b border-border/80 pb-4 mb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-volt">
            EXPLORE TECH SPECTRUM
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight mt-0.5">
            Shop By Main Categories
          </h2>
        </div>

        <Link
          to="/shop"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-volt hover:underline"
        >
          All Categories <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon
          return (
            <Link
              key={idx}
              to={cat.link}
              className={`group flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-lg ${cat.color}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 text-volt border border-border/60 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="font-bold text-sm text-foreground mt-3 group-hover:text-volt transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {cat.subtitle}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-center h-24 overflow-hidden rounded-lg bg-secondary/40 p-2">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
