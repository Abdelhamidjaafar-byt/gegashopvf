import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, Layers } from 'lucide-react'
import { useCategories } from '@/hooks/useCatalog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

// Categories nav menu — desktop hover mega-menu (parents -> subcategories).

export function CategoriesMenuDesktop() {
  const { t } = useTranslation()
  const { categories } = useCategories()
  const [open, setOpen] = useState(false)
  const [activeRoot, setActiveRoot] = useState<string | null>(null)

  const roots = useMemo(
    () => categories.filter((c) => !c.parent_id).sort((a, b) => a.name.localeCompare(b.name)),
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

  const active = activeRoot ?? roots[0]?.id ?? null
  const activeChildren = active ? childrenOf.get(active) || [] : []
  const activeRootCat = roots.find((r) => r.id === active)

  if (roots.length === 0) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1 text-sm transition-colors',
            open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t('nav.categories')}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={14}
        className="w-[560px] border-border bg-popover p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex">
          {/* Root categories */}
          <div className="w-56 shrink-0 border-r border-border py-2">
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-volt hover:bg-secondary"
            >
              <Layers className="h-4 w-4" /> {t('shop.allCategories')}
            </Link>
            {roots.map((root) => {
              const isActive = active === root.id
              const hasChildren = (childrenOf.get(root.id) || []).length > 0
              return (
                <button
                  key={root.id}
                  onMouseEnter={() => setActiveRoot(root.id)}
                  onClick={() => {
                    if (!hasChildren) setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors',
                    isActive ? 'bg-volt/10 text-volt' : 'text-foreground/90 hover:bg-secondary',
                  )}
                >
                  {hasChildren ? (
                    <span>{root.name}</span>
                  ) : (
                    <Link to={`/shop?category=${root.id}`} className="flex-1" onClick={() => setOpen(false)}>
                      {root.name}
                    </Link>
                  )}
                  {hasChildren && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              )
            })}
          </div>

          {/* Subcategories of the hovered root */}
          <div className="flex-1 p-4">
            {activeRootCat && (
              <>
                <Link
                  to={`/shop?category=${activeRootCat.id}`}
                  onClick={() => setOpen(false)}
                  className="font-display text-sm font-bold uppercase tracking-wide text-volt hover:underline"
                >
                  {t('shop.allOf')} {activeRootCat.name}
                </Link>
                {activeChildren.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-1">
                    {activeChildren.map((child) => (
                      <Link
                        key={child.id}
                        to={`/shop?category=${child.id}`}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 px-1 text-sm text-muted-foreground">{activeRootCat.name}</p>
                )}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Mobile: accordion inside the hamburger sheet.

export function CategoriesMenuMobile({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation()
  const { categories } = useCategories()
  const [expanded, setExpanded] = useState<string[]>([])

  const roots = categories.filter((c) => !c.parent_id).sort((a, b) => a.name.localeCompare(b.name))

  const toggle = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  if (roots.length === 0) return null

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('nav.categories')}
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {roots.map((root) => {
          const children = categories
            .filter((c) => c.parent_id === root.id)
            .sort((a, b) => a.name.localeCompare(b.name))
          const isOpen = expanded.includes(root.id)
          return (
            <div key={root.id}>
              <div className="flex items-center">
                <Link
                  to={`/shop?category=${root.id}`}
                  onClick={onNavigate}
                  className="flex-1 py-1.5 text-base font-medium"
                >
                  {root.name}
                </Link>
                {children.length > 0 && (
                  <button
                    onClick={() => toggle(root.id)}
                    aria-label={root.name}
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                )}
              </div>
              {isOpen && children.length > 0 && (
                <div className="ml-4 flex flex-col gap-1 border-l border-border pl-3">
                  <Link
                    to={`/shop?category=${root.id}`}
                    onClick={onNavigate}
                    className="py-1 text-sm font-medium text-volt"
                  >
                    {t('shop.allOf')} {root.name}
                  </Link>
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/shop?category=${child.id}`}
                      onClick={onNavigate}
                      className="py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
