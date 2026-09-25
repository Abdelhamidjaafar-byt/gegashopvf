import { Link } from 'react-router'
import { Gamepad2, Wrench, ArrowRight, Shield, Sparkles } from 'lucide-react'

export default function BetaDualBanners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* BANNER 1: GAMING CHAIRS & COMFORT BOOST */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/60 p-8 flex flex-col justify-between group shadow-md">
          <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-400">
              <Gamepad2 className="h-3.5 w-3.5" /> Ergonomic Pro Gaming
            </span>

            <h3 className="mt-4 font-display text-2xl md:text-3xl font-black tracking-tight">
              Corsair & Noblechairs Gaming Chairs
            </h3>

            <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
              Motorsport-inspired comfort, 4D armrests, breathable fabric & lumbar support to keep you sharp in long gaming sessions.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs font-bold text-volt">Starting from 2,490 MAD</span>
            <Link
              to="/shop?q=Chair"
              className="inline-flex items-center gap-2 rounded-xl bg-volt px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-volt-fg transition-all hover:bg-volt-dim hover:scale-105"
            >
              Browse Gaming Chairs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* BANNER 2: CUSTOM PC ASSEMBLY SERVICE IN OUJDA */}
        <div className="relative overflow-hidden rounded-2xl border border-volt/40 bg-gradient-to-br from-background via-card to-volt/5 p-8 flex flex-col justify-between group shadow-md">
          <div className="absolute top-0 right-0 h-40 w-40 bg-volt/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-volt/15 border border-volt/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-volt">
              <Wrench className="h-3.5 w-3.5" /> Custom PC Builder Service
            </span>

            <h3 className="mt-4 font-display text-2xl md:text-3xl font-black tracking-tight">
              Build & Test Your Dream PC in 24h
            </h3>

            <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
              Choose your processor, graphics card, case & memory. Our technician team in Oujda assembles, benchmarks, cable-manages & tests your rig with warranty included!
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs font-bold text-muted-foreground">Free Cable Management & Thermal Paste</span>
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 rounded-xl bg-volt px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-volt-fg transition-all hover:bg-volt-dim hover:scale-105"
            >
              Launch PC Builder <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
