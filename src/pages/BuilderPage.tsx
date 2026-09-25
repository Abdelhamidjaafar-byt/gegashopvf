import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  AlertTriangle,
  Check,
  Cpu,
  ShoppingCart,
  Zap,
  Search,
  RotateCcw,
  Sparkles,
  Package,
  Layers,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import PcAssembly from '@/components/PcAssembly'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import {
  useDynamicBuilderParts,
  type DynamicBuildPart
} from '@/hooks/useDynamicBuilderParts'
import {
  SLOTS,
  buildTotal,
  buildWatts,
  missingRequired,
  partToProduct,
  psuUndersized,
  recommendedPsu,
  socketMismatch,
  type SlotId,
} from '@/lib/builder-data'
import type { Product } from '@/types'

export type DynamicBuildSelection = Partial<Record<SlotId, DynamicBuildPart>>

export default function BuilderPage() {
  const { t, i18n } = useTranslation()
  const { add } = useCart()
  const navigate = useNavigate()

  const { parts, loading, getPartsForSlot } = useDynamicBuilderParts()

  const [selection, setSelection] = useState<DynamicBuildSelection>({})
  const [activeSlot, setActiveSlot] = useState<SlotId>('cpu')
  const [slotSearch, setSlotSearch] = useState('')

  const total = buildTotal(selection)
  const watts = buildWatts(selection)
  const psuNeeded = recommendedPsu(selection)
  const missing = missingRequired(selection)
  const socketBad = socketMismatch(selection)
  const psuBad = psuUndersized(selection)
  const selectedCount = Object.keys(selection).length
  const completePct = Math.round((selectedCount / SLOTS.length) * 100)

  // Get options for active slot & filter by slot search query
  const rawSlotOptions = useMemo(() => getPartsForSlot(activeSlot), [getPartsForSlot, activeSlot])
  const slotOptions = useMemo(() => {
    if (!slotSearch.trim()) return rawSlotOptions
    const q = slotSearch.toLowerCase().trim()
    return rawSlotOptions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.spec.toLowerCase().includes(q)
    )
  }, [rawSlotOptions, slotSearch])

  const activeDef = SLOTS.find((s) => s.id === activeSlot)!

  const pick = (slot: SlotId, part: DynamicBuildPart) => {
    setSelection((prev) => {
      const next = { ...prev }
      if (prev[slot]?.id === part.id) delete next[slot]
      else next[slot] = part
      return next
    })
  }

  const clearSlot = (slot: SlotId, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelection((prev) => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
  }

  const resetAll = () => {
    setSelection({})
    setActiveSlot('cpu')
    setSlotSearch('')
    toast.info('PC Builder configuration reset.')
  }

  const addToCart = () => {
    for (const part of Object.values(selection)) {
      if (part) {
        if (part.product) {
          // Authentic DB Product
          add(part.product)
        } else {
          // Fallback static part converted to Product
          add(partToProduct(part))
        }
      }
    }
    toast.success(t('builder.addedToCart', { count: selectedCount }))
    navigate('/cart')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-volt rounded-full">
            <Cpu className="h-3.5 w-3.5" /> Store Components Configurator
          </span>
          <h1 className="mt-3 font-display text-3xl font-black md:text-4xl tracking-tight">
            {t('builder.title')}
          </h1>
          <p className="mt-1 max-w-xl text-xs sm:text-sm text-muted-foreground">
            Configure your custom PC using available components in ElectroGega store catalog. Automatic compatibility & power check included!
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            className="h-9 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-volt" /> Reset Config
          </Button>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {t('builder.progress')}
            </div>
            <div className="font-display text-2xl font-black text-volt">{completePct}%</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        
        {/* LEFT CONFIGURATOR AREA */}
        <div>
          
          {/* SLOT SELECTION TABS */}
          <div className="flex flex-wrap gap-2">
            {SLOTS.map((slot) => {
              const pickedPart = selection[slot.id]
              const picked = !!pickedPart
              const active = activeSlot === slot.id

              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    setActiveSlot(slot.id)
                    setSlotSearch('')
                  }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                    active
                      ? 'border-volt bg-volt/15 text-volt shadow-sm'
                      : picked
                        ? 'border-volt/50 text-foreground bg-card hover:border-volt'
                        : 'border-border bg-card/60 text-muted-foreground hover:border-volt/40 hover:text-foreground',
                  )}
                >
                  {picked && <Check className="h-3.5 w-3.5 text-volt stroke-[3]" />}
                  <span>{t(`builder.slot.${slot.id}`)}</span>
                  {slot.required && <span className="text-volt">*</span>}
                  {pickedPart && (
                    <span
                      onClick={(e) => clearSlot(slot.id, e)}
                      className="ml-1 rounded-full hover:bg-volt/20 p-0.5 text-muted-foreground hover:text-volt"
                      title="Clear slot"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ACTIVE SLOT SEARCH & TITLE BAR */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-volt" />
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Select {t(`builder.slot.${activeSlot}`)}
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  ({rawSlotOptions.length} available)
                </span>
              </h3>
            </div>

            {/* Search filter for active slot options */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={slotSearch}
                onChange={(e) => setSlotSearch(e.target.value)}
                placeholder={`Search ${activeSlot}...`}
                className="h-8 pl-8 pr-7 text-xs bg-secondary border-border focus-visible:ring-volt"
              />
              {slotSearch && (
                <button
                  onClick={() => setSlotSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* COMPONENT OPTIONS CARDS LIST */}
          <div className="mt-4 space-y-2.5">
            {loading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Loading available store components...
              </div>
            ) : slotOptions.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/60 p-8 text-center text-xs text-muted-foreground">
                No components match "{slotSearch}". Try clearing the search.
              </div>
            ) : (
              slotOptions.map((part, i) => {
                const picked = selection[activeSlot]?.id === part.id
                const incompatible =
                  (activeSlot === 'motherboard' && selection.cpu?.socket && part.socket && selection.cpu.socket !== part.socket) ||
                  (activeSlot === 'cpu' && selection.motherboard?.socket && part.socket && selection.motherboard.socket !== part.socket)

                return (
                  <motion.div
                    key={part.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => pick(activeSlot, part)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border p-3.5 transition-all hover:shadow-md',
                      picked
                        ? 'border-volt bg-volt/10 ring-1 ring-volt/50'
                        : incompatible
                          ? 'border-destructive/40 bg-destructive/5 opacity-80 hover:border-destructive'
                          : 'border-border bg-card hover:border-volt/50',
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Component Image Thumbnail */}
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary flex items-center justify-center p-1">
                        {part.image ? (
                          <img src={part.image} alt={part.name} className="h-full w-full object-contain" />
                        ) : (
                          <Cpu className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-xs font-bold text-foreground">{part.name}</span>
                          
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-border/80 px-1.5 py-0">
                            {part.brand}
                          </Badge>

                          {part.isRealProduct && (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[9px] font-extrabold px-1.5 py-0">
                              STORE CATALOG
                            </Badge>
                          )}

                          {part.socket && (
                            <Badge className="bg-volt/15 text-volt border-volt/30 text-[9px] font-extrabold px-1.5 py-0">
                              {part.socket}
                            </Badge>
                          )}

                          {incompatible && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-destructive uppercase">
                              <AlertTriangle className="h-3 w-3" /> {t('builder.socketMismatch')}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 truncate text-[11px] text-muted-foreground">
                          {part.spec}
                        </div>
                      </div>
                    </div>

                    {/* Price & Selection Checkbox */}
                    <div className="flex shrink-0 items-center gap-3">
                      {part.watts > 0 && (
                        <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                          {part.watts}W
                        </span>
                      )}
                      {part.psuWatts && (
                        <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                          {part.psuWatts}W
                        </span>
                      )}
                      <span className="font-display text-sm font-extrabold text-volt">
                        {formatPrice(part.price, i18n.language)}
                      </span>
                      <div
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full border transition-all',
                          picked ? 'border-volt bg-volt text-volt-fg scale-110' : 'border-border bg-secondary',
                        )}
                      >
                        {picked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}

            {!activeDef.required && (
              <p className="pt-1 text-xs text-muted-foreground">{t('builder.optionalNote')}</p>
            )}
          </div>

          {/* COMPATIBILITY WARNING ALERTS */}
          {(socketBad || psuBad) && (
            <div className="mt-5 space-y-2">
              {socketBad && (
                <div className="flex items-center gap-2.5 rounded-xl border border-destructive/50 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {t('builder.socketWarning')}
                </div>
              )}
              {psuBad && (
                <div className="flex items-center gap-2.5 rounded-xl border border-destructive/50 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {t('builder.psuWarning', { watts: psuNeeded })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT SIDE: 3D ASSEMBLY & SUMMARY BOX */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          
          {/* Interactive SVG PC Case Visualizer */}
          <PcAssembly selection={selection as any} />

          {/* Power meter */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-volt" /> {t('builder.estimatedLoad')}
              </span>
              <span className="font-mono text-foreground">
                {watts} W / {psuNeeded} W {t('builder.recommended')}
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={cn('h-full rounded-full', psuBad ? 'bg-destructive' : 'bg-volt')}
                animate={{ width: `${Math.min(100, (watts / Math.max(psuNeeded, 1)) * 100)}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          {/* Total Price & Add To Cart CTA */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                {t('builder.total', { count: selectedCount })}
              </span>
              <span className="font-display text-2xl font-black text-volt">
                {formatPrice(total, i18n.language)}
              </span>
            </div>

            {missing.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                {t('builder.missing', { slots: missing.map((s) => t(`builder.slot.${s}`)).join(', ') })}
              </p>
            )}

            <Button
              className="mt-4 w-full bg-volt py-3 font-extrabold uppercase tracking-wider text-volt-fg hover:bg-volt-dim transition-all text-xs"
              disabled={selectedCount === 0 || missing.length > 0 || socketBad || psuBad}
              onClick={addToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t('builder.addToCart')}
            </Button>

            <p className="mt-2.5 text-center text-[10px] text-muted-foreground leading-normal">
              {t('builder.note')}
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}
