import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Layers, SlidersHorizontal, Cpu, ChevronDown, ChevronUp } from 'lucide-react'
import { useProducts, useCategories, useBrands } from '@/hooks/useCatalog'
import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Sort = 'newest' | 'price-asc' | 'price-desc' | 'name'

export default function ShopPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const { products, loading } = useProducts()
  const { categories } = useCategories()
  const { brands } = useBrands()

  const [q, setQ] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || 'all')
  const [brandIds, setBrandIds] = useState<string[]>(() => {
    const b = params.get('brand')
    return b && b !== 'all' ? [b] : []
  })
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({})
  const [isSpecsOpen, setIsSpecsOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [sort, setSort] = useState<Sort>('newest')
  const [expanded, setExpanded] = useState<string[]>([])
  const featuredOnly = params.get('featured') === '1'

  // Category tree
  const roots = useMemo(
    () =>
      categories
        .filter((c) => !c.parent_id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )
  const childrenOf = useMemo(() => {
    const map = new Map<string, Category[]>()
    for (const c of categories) {
      if (!c.parent_id) continue
      const list = map.get(c.parent_id) || []
      list.push(c)
      map.set(c.parent_id, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name))
    return map
  }, [categories])

  // Category ids covered by the current selection (a parent includes its children)
  const selectedCatIds = useMemo(() => {
    if (category === 'all') return null
    const ids = new Set([category])
    for (const child of childrenOf.get(category) || []) ids.add(child.id)
    return ids
  }, [category, childrenOf])

  // Compute available spec keys & unique values for the selected category
  const availableSpecs = useMemo(() => {
    const map = new Map<string, Set<string>>()
    const categoryProducts = selectedCatIds
      ? products.filter((p) => p.category_id && selectedCatIds.has(p.category_id))
      : products

    for (const p of categoryProducts) {
      if (!p.specs) continue
      for (const [key, val] of Object.entries(p.specs)) {
        if (!val || typeof val !== 'string' || !val.trim()) continue
        const existing = map.get(key) || new Set<string>()
        existing.add(val.trim())
        map.set(key, existing)
      }
    }

    const result: Array<{ key: string; values: string[] }> = []
    for (const [key, valSet] of map.entries()) {
      if (valSet.size > 0) {
        result.push({
          key,
          values: Array.from(valSet).sort((a, b) => a.localeCompare(b)),
        })
      }
    }
    return result.sort((a, b) => a.key.localeCompare(b.key))
  }, [products, selectedCatIds])

  // Auto-expand the branch of the category coming from the URL & toggle specs filter
  useEffect(() => {
    if (category === 'all') {
      setIsSpecsOpen(false)
      setSelectedSpecs({})
      return
    }
    setIsSpecsOpen(true)
    const current = categories.find((c) => c.id === category)
    setExpanded((prev) => {
      const next = new Set(prev)
      if (current?.parent_id) next.add(current.parent_id)
      if (childrenOf.has(category)) next.add(category)
      return [...next]
    })
  }, [category, categories, childrenOf])

  // Full price range of the catalog
  const bounds = useMemo<[number, number]>(() => {
    if (products.length === 0) return [0, 100]
    let min = Infinity
    let max = -Infinity
    for (const p of products) {
      const price = Number(p.price)
      if (price < min) min = price
      if (price > max) max = price
    }
    return [Math.floor(min), Math.ceil(max)]
  }, [products])

  const [range, setRange] = useState<[number, number] | null>(null)
  const [minBound, maxBound] = bounds
  const [minVal, maxVal] = range ?? bounds

  // Keep the slider inside bounds as products load / change
  useEffect(() => {
    setRange((prev) => {
      if (prev === null) return null
      const clamped: [number, number] = [
        Math.max(minBound, Math.min(prev[0], maxBound)),
        Math.max(minBound, Math.min(prev[1], maxBound)),
      ]
      return clamped[0] === prev[0] && clamped[1] === prev[1] ? prev : clamped
    })
  }, [minBound, maxBound])

  const step = Math.max(1, Math.round((maxBound - minBound) / 200))

  const toggleBrand = (id: string, checked: boolean | string) => {
    setBrandIds((prev) =>
      checked ? [...prev, id] : prev.filter((b) => b !== id),
    )
  }

  const toggleSpec = (specKey: string, val: string, checked: boolean | string) => {
    setSelectedSpecs((prev) => {
      const current = prev[specKey] || []
      const updated = checked ? [...current, val] : current.filter((v) => v !== val)
      if (updated.length === 0) {
        const next = { ...prev }
        delete next[specKey]
        return next
      }
      return { ...prev, [specKey]: updated }
    })
  }

  const pickCategory = (id: string) => {
    setCategory(id)
    setSelectedSpecs({}) // Reset spec filters when category changes
    if (id === 'all') return
    const cat = categories.find((c) => c.id === id)
    setExpanded((prev) => {
      const next = new Set(prev)
      if (cat?.parent_id) next.add(cat.parent_id)
      if (childrenOf.has(id)) {
        // toggle: re-clicking an expanded parent collapses it
        if (next.has(id) && category === id) next.delete(id)
        else next.add(id)
      }
      return [...next]
    })
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (q.trim()) count += 1
    if (category !== 'all') count += 1
    if (brandIds.length > 0) count += brandIds.length
    if (range !== null && (range[0] !== minBound || range[1] !== maxBound)) count += 1
    for (const vals of Object.values(selectedSpecs)) {
      count += vals.length
    }
    return count
  }, [q, category, brandIds, range, minBound, maxBound, selectedSpecs])

  const resetAllFilters = () => {
    setQ('')
    setCategory('all')
    setBrandIds([])
    setRange(null)
    setSelectedSpecs({})
  }

  const filtered = useMemo(() => {
    let list = [...products]
    if (featuredOnly) list = list.filter((p) => p.is_featured)
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle),
      )
    }
    if (selectedCatIds) list = list.filter((p) => p.category_id && selectedCatIds.has(p.category_id))
    if (brandIds.length > 0) list = list.filter((p) => p.brand_id && brandIds.includes(p.brand_id))
    list = list.filter((p) => Number(p.price) >= minVal && Number(p.price) <= maxVal)

    // Spec filters matching
    for (const [specKey, selectedVals] of Object.entries(selectedSpecs)) {
      if (selectedVals.length > 0) {
        list = list.filter((p) => {
          const productVal = p.specs?.[specKey]
          if (!productVal) return false
          return selectedVals.some((v) => productVal.toLowerCase().includes(v.toLowerCase()))
        })
      }
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'price-desc':
        list.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        list.sort((a, b) => b.created_at.localeCompare(a.created_at))
    }
    return list
  }, [products, q, selectedCatIds, brandIds, selectedSpecs, sort, minVal, maxVal, featuredOnly])

  const catButton = (
    id: string,
    label: string,
    opts: { child?: boolean; parentAll?: boolean } = {},
  ) => {
    const active = category === id
    // A parent is shown active when itself OR any of its children is selected
    const branchActive =
      !opts.child && (active || (childrenOf.get(id) || []).some((c) => c.id === category))
    const highlighted = opts.child ? active : branchActive
    return (
      <button
        key={id + label}
        onClick={() => pickCategory(id)}
        className={cn(
          'block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
          opts.child && 'pl-7 text-muted-foreground hover:text-foreground',
          highlighted
            ? opts.child
              ? 'bg-primary/15 font-medium text-primary'
              : 'bg-primary/20 font-semibold text-primary'
            : !opts.child && 'text-foreground/90 hover:bg-secondary',
        )}
      >
        {label}
      </button>
    )
  }

  const renderFiltersContent = () => (
    <div className="space-y-6">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('nav.search')}
        className="bg-secondary"
      />

      {/* Category tree */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
          <Layers className="h-4 w-4 text-primary" /> {t('shop.category')}
        </div>
        <div className="space-y-0.5">
          {catButton('all', t('shop.allCategories'))}
          {roots.map((root) => {
            const children = childrenOf.get(root.id) || []
            const isExpanded = expanded.includes(root.id)
            return (
              <div key={root.id}>
                {catButton(root.id, root.name)}
                {isExpanded && children.length > 0 && (
                  <div className="mt-0.5 space-y-0.5">
                    {catButton(root.id, `${t('shop.allOf')} ${root.name}`, { child: true, parentAll: true })}
                    {children.map((child) => catButton(child.id, child.name, { child: true }))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Brand checkboxes */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
          <Layers className="h-4 w-4 text-primary" /> {t('shop.brand')}
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-secondary">
            <Checkbox
              checked={brandIds.length === 0}
              onCheckedChange={() => setBrandIds([])}
            />
            {t('shop.allBrands')}
          </label>
          {brands.map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Checkbox
                checked={brandIds.includes(b.id)}
                onCheckedChange={(checked) => toggleBrand(b.id, checked)}
              />
              {b.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <div className="mb-3 text-sm font-semibold uppercase tracking-wide">{t('shop.priceRange')}</div>
        <div className="px-1">
          <Slider
            className="volt-slider"
            min={minBound}
            max={maxBound}
            step={step}
            minStepsBetweenThumbs={1}
            value={[minVal, maxVal]}
            onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium tabular-nums">
            MAD {minVal.toLocaleString('en-US')}
          </span>
          <span className="text-xs text-muted-foreground">—</span>
          <span className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium tabular-nums">
            MAD {maxVal.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Dynamic Specifications Filter */}
      {category !== 'all' && availableSpecs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSpecsOpen(!isSpecsOpen)}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors text-left"
            >
              <Cpu className="h-4 w-4 text-primary" />
              <span>{t('shop.specsFilter')}</span>
              {isSpecsOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
              )}
            </button>
            {Object.keys(selectedSpecs).length > 0 && isSpecsOpen && (
              <button
                onClick={() => setSelectedSpecs({})}
                className="text-xs text-primary hover:underline"
              >
                {t('shop.clearSpecs')}
              </button>
            )}
          </div>

          {isSpecsOpen && (
            <div className="space-y-4 pt-1">
              {availableSpecs.map((spec) => (
                <div key={spec.key} className="space-y-1.5">
                  <div className="text-xs font-semibold text-foreground/80">{spec.key}</div>
                  <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                    {spec.values.map((val) => {
                      const isChecked = selectedSpecs[spec.key]?.includes(val) || false
                      return (
                        <label
                          key={val}
                          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => toggleSpec(spec.key, val, checked)}
                          />
                          <span className="truncate">{val}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{t('shop.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('shop.results', { count: filtered.length })}</p>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="self-start sm:self-auto text-xs font-medium text-primary hover:underline"
          >
            {t('shop.clearAll')} ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Mobile & Tablet Filter Controls */}
      <div className="mt-6 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
            className="flex-1 sm:flex-none justify-between border-border bg-card font-semibold text-sm"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>{t('shop.filters')}</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </span>
            {isMobileFiltersOpen ? (
              <ChevronUp className="h-4 w-4 ml-2 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
            )}
          </Button>

          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-44 bg-secondary"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('shop.sortNewest')}</SelectItem>
              <SelectItem value="price-asc">{t('shop.sortPriceAsc')}</SelectItem>
              <SelectItem value="price-desc">{t('shop.sortPriceDesc')}</SelectItem>
              <SelectItem value="name">{t('shop.sortName')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown container on Mobile/Tablet */}
        {isMobileFiltersOpen && (
          <div className="mt-3 rounded-lg border border-border bg-card p-5 shadow-xl transition-all animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <span className="font-semibold text-sm uppercase tracking-wide flex items-center gap-2 text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                {t('shop.filters')}
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {t('shop.clearAll')}
                </button>
              )}
            </div>
            {renderFiltersContent()}
          </div>
        )}
      </div>

      <div className="mt-6 lg:mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> {t('shop.filters')}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t('shop.clearAll')}
              </button>
            )}
          </div>
          {renderFiltersContent()}
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {/* Desktop Sort Select */}
          <div className="hidden lg:flex mb-5 justify-end">
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-48 bg-secondary"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('shop.sortNewest')}</SelectItem>
                <SelectItem value="price-asc">{t('shop.sortPriceAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('shop.sortPriceDesc')}</SelectItem>
                <SelectItem value="name">{t('shop.sortName')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">{t('shop.empty')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

