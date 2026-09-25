import BetaHero from '@/components/beta/BetaHero'
import BetaFeaturesBar from '@/components/beta/BetaFeaturesBar'
import BetaSidebar from '@/components/beta/BetaSidebar'
import BetaMainShowcase from '@/components/beta/BetaMainShowcase'
import BetaAppleSpotlight from '@/components/beta/BetaAppleSpotlight'
import BetaDualBanners from '@/components/beta/BetaDualBanners'
import BetaCategoryGrid from '@/components/beta/BetaCategoryGrid'
import BetaHighlightCards from '@/components/beta/BetaHighlightCards'
import BrandCarousel from '@/components/BrandCarousel'

export default function HomePage() {
  return (
    <div className="space-y-6 pb-4">
      {/* 1. HERO 4-QUADRANT GRID */}
      <BetaHero />

      {/* 2. TRUST & VALUE FEATURES BAR */}
      <BetaFeaturesBar />

      {/* 3. MAIN SECTION GRID: LEFT SIDEBAR + RIGHT MAIN SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Sidebar (3 cols on lg) */}
          <div className="lg:col-span-3">
            <BetaSidebar />
          </div>

          {/* Right Main Showcase (9 cols on lg) */}
          <div className="lg:col-span-9">
            <BetaMainShowcase />
          </div>

        </div>
      </section>

      {/* 4. HAND PICKED APPLE PRODUCTS SPOTLIGHT */}
      <BetaAppleSpotlight />

      {/* 5. DUAL PROMO BANNERS (GAMING CHAIRS & PC BUILDER) */}
      <BetaDualBanners />

      {/* 6. SHOP BY CATEGORY VISUAL GRID */}
      <BetaCategoryGrid />

      {/* 7. 3-COLUMN FEATURE HIGHLIGHT CARDS */}
      <BetaHighlightCards />

      {/* 8. BRAND PARTNERS CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="border-t border-border/80 pt-6">
          <BrandCarousel />
        </div>
      </section>
    </div>
  )
}
