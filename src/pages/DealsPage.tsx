import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import OffersCollection from '@/components/OffersCollection'
import DealOfDay from '@/components/DealOfDay'
import BrandCarousel from '@/components/BrandCarousel'

export default function DealsPage() {


  return (
    <div className="min-h-screen bg-background">
      {/* Deals Hero Banner */}
      <section className="relative border-b border-border bg-card/40 py-12">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-volt/10 blur-[100px]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-volt">
              <Sparkles className="h-3.5 w-3.5" /> Exclusive Discounts & Flash Sales
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold md:text-6xl">
              Special <span className="text-volt">Offers & Deals</span>
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground text-base">
              Discover active promotional prices, daily bargains, and limited-time countdown sales across smartphones, laptops, GPUs, and gaming accessories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Deal of the Day */}
      <DealOfDay />

      {/* Offers Collection Grid */}
      <OffersCollection />

      {/* Brands Banner */}
      <div className="py-8">
        <BrandCarousel />
      </div>
    </div>
  )
}
