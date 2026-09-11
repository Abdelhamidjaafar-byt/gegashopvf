import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useProducts } from '@/hooks/useCatalog'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import ProductCard from './ProductCard'

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { t } = useTranslation()
  const { products } = useProducts()
  const { ids } = useRecentlyViewed()

  const items = useMemo(
    () =>
      ids
        .filter((id) => id !== excludeId)
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean)
        .slice(0, 4),
    [ids, products, excludeId],
  )

  if (!items.length) return null
  return (
    <section className="mt-16">
      <h2 className="font-display text-xl font-bold">{t('product.recentlyViewed')}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p!.id} product={p!} index={i} />
        ))}
      </div>
    </section>
  )
}
