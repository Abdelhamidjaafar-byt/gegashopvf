import { Link } from 'react-router'
import { useBrands } from '@/hooks/useCatalog'

/** Seamlessly looping brand marquee (CSS animation, duplicated track). */
export default function BrandCarousel() {
  const { brands } = useBrands()
  if (!brands.length) return null
  const track = [...brands, ...brands]
  return (
    <div className="relative overflow-hidden border-y border-border bg-card/50 py-8">
      <div className="animate-marquee flex w-max items-center gap-16 px-8">
        {track.map((b, i) => (
          <Link
            key={`${b.id}-${i}`}
            to={`/shop?brand=${b.id}`}
            className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-volt whitespace-nowrap"
          >
            {b.name}
          </Link>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}
