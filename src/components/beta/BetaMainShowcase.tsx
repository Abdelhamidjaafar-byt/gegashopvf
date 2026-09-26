import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { Cpu, Gamepad2, Laptop, Sliders, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProducts } from '@/hooks/useCatalog'
import ProductCard from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function BetaMainShowcase() {
  const { t, i18n } = useTranslation()
  const { products, loading } = useProducts()
  const [activeTab, setActiveTab] = useState('all')

  const isEn = i18n.language?.startsWith('en')

  const tabs = [
    { id: 'all', label: isEn ? 'All Setups & Gear' : 'Tous les Setups & Matériel', icon: Sparkles },
    { id: 'intel', label: isEn ? 'Intel Gaming PCs' : 'PC Gamer Intel', icon: Cpu },
    { id: 'ryzen', label: isEn ? 'AMD Ryzen Builds' : 'Configs AMD Ryzen', icon: Gamepad2 },
    { id: 'laptops', label: isEn ? 'Gaming Laptops' : 'PC Portables Gamer', icon: Laptop },
    { id: 'components', label: isEn ? 'Components & GPUs' : 'Composants & Cartes Graphiques', icon: Sliders },
  ]

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return products
    if (activeTab === 'intel') {
      return products.filter((p) =>
        p.name.toLowerCase().includes('intel') || p.description.toLowerCase().includes('intel') || p.specs?.cpu?.toLowerCase().includes('intel')
      )
    }
    if (activeTab === 'ryzen') {
      return products.filter((p) =>
        p.name.toLowerCase().includes('ryzen') || p.name.toLowerCase().includes('amd') || p.description.toLowerCase().includes('ryzen') || p.specs?.cpu?.toLowerCase().includes('ryzen')
      )
    }
    if (activeTab === 'laptops') {
      return products.filter((p) =>
        p.category_id === 'laptops' || p.name.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('macbook')
      )
    }
    if (activeTab === 'components') {
      return products.filter((p) =>
        p.category_id === 'composants' || p.category_id === 'pc-component' || p.name.toLowerCase().includes('rtx') || p.name.toLowerCase().includes('motherboard')
      )
    }
    return products
  }, [products, activeTab])

  const displayList = filteredProducts.slice(0, 8)

  return (
    <section className="space-y-6">
      
      {/* SECTION HEADER & FILTER TABS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-volt">
            <Sparkles className="h-3.5 w-3.5" /> {t('showcase.badge', 'Performances Extrêmes')}
          </span>
          <h2 className="font-display text-2xl font-black md:text-3xl tracking-tight mt-0.5">
            {t('showcase.title', 'PC, Portables & Composants en Vedette')}
          </h2>
        </div>

        {/* Filter Tab Buttons */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-volt text-volt-fg shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* PRODUCT CARDS GRID */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
            ))
          : displayList.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
      </div>

      {/* VIEW ALL STORE BUTTON */}
      <div className="mt-8 flex justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-xl border border-volt/60 bg-volt/10 px-8 py-3 text-sm font-extrabold uppercase tracking-wider text-volt transition-all hover:bg-volt hover:text-volt-fg hover:shadow-lg"
        >
          {isEn
            ? `View Full Store Catalog (${products.length} Products)`
            : `Voir tout le catalogue de la boutique (${products.length} Produits)`} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </section>
  )
}
