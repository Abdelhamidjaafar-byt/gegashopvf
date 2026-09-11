import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { AlertTriangle, Check, Cpu, ShoppingCart, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import PcAssembly from '@/components/PcAssembly'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import {
  SLOTS,
  buildTotal,
  buildWatts,
  missingRequired,
  partToProduct,
  partsForSlot,
  psuUndersized,
  recommendedPsu,
  socketMismatch,
  type BuildSelection,
  type SlotId,
} from '@/lib/builder-data'

export default function BuilderPage() {
  const { t, i18n } = useTranslation()
  const { add } = useCart()
  const navigate = useNavigate()
  const [selection, setSelection] = useState<BuildSelection>({})
  const [activeSlot, setActiveSlot] = useState<SlotId>('cpu')

  const total = buildTotal(selection)
  const watts = buildWatts(selection)
  const psuNeeded = recommendedPsu(selection)
  const missing = missingRequired(selection)
  const socketBad = socketMismatch(selection)
  const psuBad = psuUndersized(selection)
  const selectedCount = Object.keys(selection).length
  const completePct = Math.round((selectedCount / SLOTS.length) * 100)

  const options = useMemo(() => partsForSlot(activeSlot), [activeSlot])
  const activeDef = SLOTS.find((s) => s.id === activeSlot)!

  const pick = (slot: SlotId, partId: string) => {
    setSelection((prev) => {
      const next = { ...prev }
      if (prev[slot]?.id === partId) delete next[slot]
      else next[slot] = options.find((p) => p.id === partId)
      return next
    })
  }

  const addToCart = () => {
    for (const part of Object.values(selection)) {
      if (part) add(partToProduct(part))
    }
    toast.success(t('builder.addedToCart', { count: selectedCount }))
    navigate('/cart')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-volt">
            <Cpu className="h-3.5 w-3.5" /> {t('builder.badge')}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t('builder.title')}</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t('builder.subtitle')}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{t('builder.progress')}</div>
          <div className="font-display text-2xl font-bold text-volt">{completePct}%</div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Configurator */}
        <div>
          {/* Slot tabs */}
          <div className="flex flex-wrap gap-2">
            {SLOTS.map((slot) => {
              const picked = !!selection[slot.id]
              const active = activeSlot === slot.id
              return (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlot(slot.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors',
                    active
                      ? 'border-volt bg-volt/15 text-volt'
                      : picked
                        ? 'border-volt/40 text-foreground hover:border-volt'
                        : 'border-border text-muted-foreground hover:border-volt/50 hover:text-foreground',
                  )}
                >
                  {picked && <Check className="h-3 w-3 text-volt" />}
                  {t(`builder.slot.${slot.id}`)}
                  {slot.required && <span className="text-volt">*</span>}
                </button>
              )
            })}
          </div>

          {/* Options for active slot */}
          <div className="mt-5 space-y-2">
            {options.map((part, i) => {
              const picked = selection[activeSlot]?.id === part.id
              const incompatible =
                (activeSlot === 'motherboard' && selection.cpu?.socket && part.socket && selection.cpu.socket !== part.socket) ||
                (activeSlot === 'cpu' && selection.motherboard?.socket && part.socket && selection.motherboard.socket !== part.socket)
              return (
                <motion.button
                  key={part.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => pick(activeSlot, part.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 rounded-md border p-3.5 text-left transition-colors',
                    picked
                      ? 'border-volt bg-volt/10'
                      : incompatible
                        ? 'border-destructive/40 bg-destructive/5 opacity-80 hover:border-destructive'
                        : 'border-border bg-card hover:border-volt/50',
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{part.name}</span>
                      <span className="shrink-0 rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {part.brand}
                      </span>
                      {incompatible && (
                        <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase text-destructive">
                          <AlertTriangle className="h-3 w-3" /> {t('builder.socketMismatch')}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{part.spec}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {part.watts > 0 && <span className="text-xs tabular-nums text-muted-foreground">{part.watts} W</span>}
                    {part.psuWatts && <span className="text-xs tabular-nums text-muted-foreground">{part.psuWatts} W</span>}
                    <span className="font-display text-sm font-bold tabular-nums">{formatPrice(part.price, i18n.language)}</span>
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border',
                        picked ? 'border-volt bg-volt text-volt-fg' : 'border-border',
                      )}
                    >
                      {picked && <Check className="h-3 w-3" />}
                    </span>
                  </div>
                </motion.button>
              )
            })}
            {!activeDef.required && (
              <p className="pt-1 text-xs text-muted-foreground">{t('builder.optionalNote')}</p>
            )}
          </div>

          {/* Compatibility warnings */}
          {(socketBad || psuBad) && (
            <div className="mt-4 space-y-2">
              {socketBad && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {t('builder.socketWarning')}
                </div>
              )}
              {psuBad && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {t('builder.psuWarning', { watts: psuNeeded })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assembly + summary */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <PcAssembly selection={selection} />

          {/* Power meter */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-volt" /> {t('builder.estimatedLoad')}</span>
              <span className="tabular-nums">{watts} W / {psuNeeded} W {t('builder.recommended')}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={cn('h-full rounded-full', psuBad ? 'bg-destructive' : 'bg-volt')}
                animate={{ width: `${Math.min(100, (watts / Math.max(psuNeeded, 1)) * 100)}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          {/* Total + CTA */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('builder.total', { count: selectedCount })}</span>
              <span className="font-display text-2xl font-bold text-volt">{formatPrice(total, i18n.language)}</span>
            </div>
            {missing.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t('builder.missing', { slots: missing.map((s) => t(`builder.slot.${s}`)).join(', ') })}
              </p>
            )}
            <Button
              className="mt-3 w-full bg-volt font-bold uppercase tracking-wide text-volt-fg hover:bg-volt-dim"
              disabled={selectedCount === 0 || missing.length > 0 || socketBad || psuBad}
              onClick={addToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t('builder.addToCart')}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">{t('builder.note')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
