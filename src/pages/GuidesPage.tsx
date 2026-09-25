import { Link } from 'react-router'
import { BookOpen, Clock, ArrowRight, ShieldCheck } from 'lucide-react'
import { GUIDES } from '@/data/guides'
import { Button } from '@/components/ui/button'

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-secondary/80 via-card to-background p-8 md:p-12 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-volt">
          <BookOpen className="h-4 w-4" /> ElectroGega Tech Guides & Reviews
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Hardware Guides & Hardware Tuning
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
          Expert recommendations, PC building walkthroughs, and buying advice tailored for Moroccan gamers and tech enthusiasts.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
        {GUIDES.map((guide) => (
          <article
            key={guide.id}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-volt/50 hover:shadow-lg"
          >
            <div>
              <div className="relative h-52 w-full overflow-hidden bg-muted">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-volt px-3 py-1 text-[11px] font-black uppercase tracking-wider text-volt-fg shadow">
                  {guide.category}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{guide.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {guide.readTime}
                  </span>
                </div>

                <h2 className="mt-3 font-display text-xl font-extrabold text-foreground group-hover:text-volt transition-colors">
                  {guide.title}
                </h2>

                <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {guide.summary}
                </p>
              </div>
            </div>

            <div className="border-t border-border/80 px-6 py-4 flex items-center justify-between bg-secondary/30">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-volt" /> {guide.author}
              </span>
              <Button asChild variant="ghost" size="sm" className="gap-1 font-bold text-xs text-volt hover:text-volt-dim">
                <Link to={`/guides/${guide.id}`}>
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
