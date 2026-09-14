import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Zap,
  Plus,
  Trash2,
  Edit,
  Clock,
  Star,
  Percent,
  Timer,
} from 'lucide-react'
import { useOffers } from '@/hooks/useOffers'
import { useProducts } from '@/hooks/useCatalog'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Offer } from '@/types'
import { toast } from 'sonner'

export default function OffersTab() {
  const { i18n } = useTranslation()
  const { offers, createOffer, updateOffer, deleteOffer, toggleOfferActive, setDealOfDay } = useOffers()
  const { products } = useProducts()


  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)

  // Form states
  const [productId, setProductId] = useState('')
  const [title, setTitle] = useState('')
  const [badge, setBadge] = useState('Flash Sale')
  const [description, setDescription] = useState('')
  const [discountPercent, setDiscountPercent] = useState<number>(20)
  const [discountedPrice, setDiscountedPrice] = useState<string>('')
  const [endTime, setEndTime] = useState('')
  const [claimedPct, setClaimedPct] = useState(50)
  const [isDealOfDay, setIsDealOfDay] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  )

  // Calculate prices based on selected product & discount
  const originalPrice = selectedProduct ? Number(selectedProduct.price) : 0

  const handleProductChange = (id: string) => {
    setProductId(id)
    const prod = products.find((p) => p.id === id)
    if (prod) {
      if (!title) setTitle(prod.name)
      const calculated = Math.round(Number(prod.price) * (1 - discountPercent / 100))
      setDiscountedPrice(calculated.toString())
    }
  }

  const handleDiscountPercentChange = (pct: number) => {
    setDiscountPercent(pct)
    if (originalPrice > 0) {
      const calculated = Math.round(originalPrice * (1 - pct / 100))
      setDiscountedPrice(calculated.toString())
    }
  }

  const handleDiscountedPriceChange = (val: string) => {
    setDiscountedPrice(val)
    const num = Number(val)
    if (originalPrice > 0 && num >= 0 && num <= originalPrice) {
      const pct = Math.round(((originalPrice - num) / originalPrice) * 100)
      setDiscountPercent(pct)
    }
  }

  // Quick Timer Presets
  const applyTimerPreset = (hours: number | 'midnight') => {
    const now = new Date()
    let target = new Date()
    if (hours === 'midnight') {
      target.setHours(24, 0, 0, 0)
    } else {
      target = new Date(now.getTime() + hours * 3600 * 1000)
    }
    // Format for datetime-local picker YYYY-MM-DDTHH:mm
    const tzOffset = target.getTimezoneOffset() * 60000
    const localIso = new Date(target.getTime() - tzOffset).toISOString().slice(0, 16)
    setEndTime(localIso)
  }

  const openCreateModal = () => {
    setEditingOffer(null)
    const firstProd = products[0]
    setProductId(firstProd ? firstProd.id : '')
    setTitle(firstProd ? firstProd.name : '')
    setBadge('Flash Sale')
    setDescription('')
    setDiscountPercent(25)
    if (firstProd) {
      setDiscountedPrice(Math.round(Number(firstProd.price) * 0.75).toString())
    } else {
      setDiscountedPrice('')
    }
    applyTimerPreset(24) // Default 24 hours
    setClaimedPct(60)
    setIsDealOfDay(false)
    setIsActive(true)
    setDialogOpen(true)
  }

  const openEditModal = (off: Offer) => {
    setEditingOffer(off)
    setProductId(off.product_id)
    setTitle(off.title)
    setBadge(off.badge)
    setDescription(off.description || '')
    setDiscountPercent(off.discount_percent)
    setDiscountedPrice(off.discounted_price ? off.discounted_price.toString() : '')
    
    // Format existing end_time for datetime-local
    const d = new Date(off.end_time)
    const tzOffset = d.getTimezoneOffset() * 60000
    const localIso = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16)
    setEndTime(localIso)

    setClaimedPct(off.claimed_percentage)
    setIsDealOfDay(off.is_deal_of_day)
    setIsActive(off.is_active)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) {
      toast.error('Please select a product')
      return
    }
    if (!endTime) {
      toast.error('Please set an end time for the offer timer')
      return
    }

    const payload = {
      title,
      badge,
      description,
      product_id: productId,
      discount_percent: discountPercent,
      discounted_price: Number(discountedPrice) || Math.round(originalPrice * (1 - discountPercent / 100)),
      start_time: new Date().toISOString(),
      end_time: new Date(endTime).toISOString(),
      claimed_percentage: claimedPct,
      is_deal_of_day: isDealOfDay,
      is_active: isActive,
    }

    if (editingOffer) {
      await updateOffer(editingOffer.id, payload)
      toast.success('Offer updated successfully')
    } else {
      await createOffer(payload)
      toast.success('New offer & countdown timer created!')
    }

    setDialogOpen(false)
  }

  const getTimeStatus = (endIso: string, active: boolean) => {
    if (!active) return { label: 'Inactive', color: 'bg-muted text-muted-foreground border-border' }
    const diff = new Date(endIso).getTime() - Date.now()
    if (diff <= 0) return { label: 'Expired', color: 'bg-red-500/10 text-red-400 border-red-500/30' }
    
    const hrs = Math.floor(diff / (1000 * 3600))
    const mins = Math.floor((diff % (1000 * 3600)) / (1000 * 60))
    return {
      label: `Live (${hrs}h ${mins}m left)`,
      color: 'bg-volt/10 text-volt border-volt/30',
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Zap className="h-5 w-5 text-volt" /> Active Offers & Timers
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage flash sales, daily deals, countdown timers, and discount percentages.
          </p>
        </div>

        <Button onClick={openCreateModal} className="bg-volt text-volt-fg hover:bg-volt-dim font-bold">
          <Plus className="mr-2 h-4 w-4" /> Create New Offer
        </Button>
      </div>

      {/* Offers Grid / List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => {
          const prod = offer.product || products.find((p) => p.id === offer.product_id)
          const status = getTimeStatus(offer.end_time, offer.is_active)
          const origPrice = prod ? Number(prod.price) : 0
          const finalPrice = offer.discounted_price || Math.round(origPrice * (1 - offer.discount_percent / 100))

          return (
            <div
              key={offer.id}
              className={`relative overflow-hidden rounded-lg border bg-card p-5 transition-all ${
                offer.is_deal_of_day ? 'border-volt/60 ring-1 ring-volt/40 shadow-lg' : 'border-border'
              }`}
            >
              {/* Top Row Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/40 bg-volt/10 px-2.5 py-0.5 text-xs font-bold text-volt uppercase tracking-wider">
                  {offer.badge}
                </span>
                
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>
                  <Timer className="h-3 w-3" /> {status.label}
                </span>
              </div>

              {/* Title & Product Info */}
              <div className="mt-4 flex items-start gap-3">
                {prod && prod.images && prod.images[0] ? (
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="h-16 w-16 rounded-md object-contain border border-border bg-secondary/50 p-1 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md border border-border bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                    <Percent className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base line-clamp-1">{offer.title}</h3>
                  {prod && <p className="text-xs text-muted-foreground line-clamp-1">{prod.name}</p>}
                  
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-lg font-bold text-volt">
                      {formatPrice(finalPrice, i18n.language)}
                    </span>
                    {origPrice > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(origPrice, i18n.language)}
                      </span>
                    )}
                    <Badge variant="outline" className="bg-volt/20 text-volt border-volt/40 text-[10px] px-1.5 py-0">
                      -{offer.discount_percent}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Deal of the Day Indicator */}
              {offer.is_deal_of_day && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-volt bg-volt/10 px-2.5 py-1 rounded border border-volt/20">
                  <Star className="h-3.5 w-3.5 fill-volt" /> Featured Deal of the Day
                </div>
              )}

              {/* Stock / Claimed Urgency */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Claimed: {offer.claimed_percentage}%</span>
                  <span>Ends: {new Date(offer.end_time).toLocaleDateString()} {new Date(offer.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-volt rounded-full"
                    style={{ width: `${offer.claimed_percentage}%` }}
                  />
                </div>
              </div>

              {/* Controls Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-border/80 pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={offer.is_active}
                    onCheckedChange={(checked) => toggleOfferActive(offer.id, checked)}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {offer.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {!offer.is_deal_of_day && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDealOfDay(offer.id)}
                      title="Set as Hero Deal of the Day"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-volt"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(offer)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm('Delete this offer?')) deleteOffer(offer.id)
                    }}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {offers.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-bold">No active offers or timers yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create flash sales and set expiration timers to boost sales.
          </p>
          <Button onClick={openCreateModal} className="mt-4 bg-volt text-volt-fg hover:bg-volt-dim font-bold">
            <Plus className="mr-2 h-4 w-4" /> Create Offer
          </Button>
        </div>
      )}

      {/* Add / Edit Offer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Zap className="h-5 w-5 text-volt" />
              {editingOffer ? 'Edit Offer & Timer' : 'Create New Offer & Countdown Timer'}
            </DialogTitle>
            <DialogDescription>
              Set offer discount, badge text, expiration countdown timer, and featured settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Product selection */}
            <div className="space-y-1.5">
              <Label className="font-semibold">Target Product</Label>
              <Select value={productId} onValueChange={handleProductChange}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatPrice(Number(p.price), i18n.language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Title */}
              <div className="space-y-1.5">
                <Label className="font-semibold">Offer Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. RTX 4080 Flash Sale"
                  className="bg-secondary"
                  required
                />
              </div>

              {/* Badge */}
              <div className="space-y-1.5">
                <Label className="font-semibold">Offer Badge Tag</Label>
                <Input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Deal of the Day, Flash Sale"
                  className="bg-secondary"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-semibold">Short Subtitle / Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight key specs or promo highlight..."
                className="bg-secondary h-20"
              />
            </div>

            {/* Pricing & Discount */}
            <div className="grid gap-4 rounded-lg border border-border bg-card/40 p-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">Original Price</Label>
                <div className="h-10 px-3 flex items-center rounded-md border border-border bg-secondary/50 font-semibold text-sm text-muted-foreground">
                  {formatPrice(originalPrice, i18n.language)}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">Discount %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={discountPercent}
                    onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                    className="bg-secondary pr-8"
                    required
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">Discounted Offer Price (MAD)</Label>
                <Input
                  type="number"
                  min={0}
                  value={discountedPrice}
                  onChange={(e) => handleDiscountedPriceChange(e.target.value)}
                  className="bg-secondary text-volt font-bold"
                  required
                />
              </div>
            </div>

            {/* Timer Management */}
            <div className="space-y-2 rounded-lg border border-volt/30 bg-volt/5 p-4">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-volt flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Offer Countdown Timer Expiration
                </Label>
              </div>

              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-background border-volt/30 text-foreground font-mono"
                required
              />

              {/* Quick Timer Preset Buttons */}
              <div className="pt-2">
                <span className="text-xs text-muted-foreground font-medium block mb-1.5">Quick Duration Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => applyTimerPreset(1)}>
                    +1 Hour
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => applyTimerPreset(6)}>
                    +6 Hours
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => applyTimerPreset(24)}>
                    +24 Hours
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => applyTimerPreset('midnight')}>
                    End at Midnight
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => applyTimerPreset(168)}>
                    +7 Days
                  </Button>
                </div>
              </div>
            </div>

            {/* Claimed Urgency Slider & Options */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">Stock Claimed Percentage ({claimedPct}%)</Label>
                <Input
                  type="range"
                  min={10}
                  max={95}
                  value={claimedPct}
                  onChange={(e) => setClaimedPct(Number(e.target.value))}
                  className="accent-volt cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-around rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Switch id="deal-of-day" checked={isDealOfDay} onCheckedChange={setIsDealOfDay} />
                  <Label htmlFor="deal-of-day" className="cursor-pointer text-xs font-semibold">
                    Hero Deal of Day
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch id="active-toggle" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="active-toggle" className="cursor-pointer text-xs font-semibold">
                    Active
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-volt text-volt-fg hover:bg-volt-dim font-bold">
                {editingOffer ? 'Save Offer Changes' : 'Launch Offer & Timer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
