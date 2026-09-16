import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Trash2,
  Edit2,
  Video,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useHeroSlides } from '@/hooks/useHeroSlides'
import type { HeroSlide } from '@/types/hero'
import { fileToResizedDataUrl } from '@/lib/image'
import HeroBubble from '@/components/HeroBubble'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function HeroTab() {
  const { t } = useTranslation()
  const {
    slides,
    loading,
    addSlide,
    updateSlide,
    deleteSlide,
    toggleSlideActive,
    moveSlide,
    resetToDefaults,
  } = useHeroSlides()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [formData, setFormData] = useState<Omit<HeroSlide, 'id' | 'order'>>({
    type: 'video',
    url: 'hero.mp4',
    badge: 'New season drops are live',
    titleA: 'Tech that',
    titleB: 'electrifies.',
    sub: 'Phones, laptops, audio and gaming gear — hand-picked, fairly priced, and delivered anywhere in Morocco by Cathedis.',
    bubbleText: '🔥 Fast 24h Express Delivery in Morocco!',
    ctaText: 'Shop now',
    ctaLink: '/shop',
    active: true,
  })
  const [uploading, setUploading] = useState(false)

  const openAddDialog = () => {
    setEditingSlide(null)
    setFormData({
      type: 'image',
      url: '',
      badge: 'Special Announcement',
      titleA: 'Discover New',
      titleB: 'Arrivals',
      sub: 'Explore top tier gaming gear and laptops.',
      bubbleText: '⚡ Exclusive discounts available now!',
      ctaText: 'Shop now',
      ctaLink: '/shop',
      active: true,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setFormData({
      type: slide.type,
      url: slide.url,
      badge: slide.badge || '',
      titleA: slide.titleA || '',
      titleB: slide.titleB || '',
      sub: slide.sub || '',
      bubbleText: slide.bubbleText || '',
      ctaText: slide.ctaText || 'Shop now',
      ctaLink: slide.ctaLink || '/shop',
      active: slide.active,
    })
    setDialogOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      if (file.type.startsWith('image/')) {
        const dataUrl = await fileToResizedDataUrl(file, 1400, 0.85)
        setFormData((prev) => ({ ...prev, type: 'image', url: dataUrl }))
        toast.success('Image processed successfully')
      } else if (file.type.startsWith('video/')) {
        // Read small videos as data URL or object URL
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormData((prev) => ({ ...prev, type: 'video', url: event.target!.result as string }))
            toast.success('Video loaded successfully')
          }
        }
        reader.readAsDataURL(file)
      } else {
        toast.error('Unsupported file format')
      }
    } catch {
      toast.error('Failed to process uploaded media file')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url.trim()) {
      toast.error('Media URL or file is required')
      return
    }

    if (editingSlide) {
      await updateSlide(editingSlide.id, formData)
      toast.success('Hero item updated')
    } else {
      await addSlide(formData)
      toast.success('New Hero media item added')
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.confirmDelete', 'Delete this item? This cannot be undone.'))) {
      await deleteSlide(id)
      toast.success('Hero media item deleted')
    }
  }

  const handleReset = async () => {
    if (confirm('Reset hero media items to default settings?')) {
      await resetToDefaults()
      toast.success('Reset to default hero item')
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Video className="h-5 w-5 text-volt" />
            Hero Section Media & Bubble Settings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add videos or images to the homepage Hero section. If 1 item is active, it displays statically.
            If multiple items are active, it automatically creates a dynamic carousel slideshow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleReset} className="border-border">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Defaults
          </Button>
          <Button onClick={openAddDialog} className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
            <Plus className="mr-2 h-4 w-4" />
            Add Hero Media
          </Button>
        </div>
      </div>

      {/* List of Hero Slides */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`relative flex flex-col justify-between overflow-hidden rounded-lg border bg-card p-5 transition-all ${
              slide.active ? 'border-border' : 'border-dashed border-muted-foreground/30 opacity-60'
            }`}
          >
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={slide.type === 'video' ? 'default' : 'secondary'} className="uppercase">
                    {slide.type === 'video' ? (
                      <Video className="mr-1 h-3 w-3" />
                    ) : (
                      <ImageIcon className="mr-1 h-3 w-3" />
                    )}
                    {slide.type}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">Slide #{index + 1}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => moveSlide(slide.id, 'up')}
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={index === slides.length - 1}
                    onClick={() => moveSlide(slide.id, 'down')}
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={slide.active ? 'outline' : 'ghost'}
                    className={`h-8 w-8 ${slide.active ? 'text-emerald-500 border-emerald-500/30' : 'text-muted-foreground'}`}
                    onClick={() => toggleSlideActive(slide.id)}
                    title={slide.active ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                  >
                    {slide.active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Media Preview Box */}
              <div className="relative mt-3 h-40 w-full overflow-hidden rounded-md border border-border bg-black/40">
                {slide.type === 'video' ? (
                  <video
                    src={slide.url}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="h-full w-full object-cover opacity-80"
                  />
                ) : (
                  <img src={slide.url} alt="Hero slide" className="h-full w-full object-cover opacity-85" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent p-3 flex flex-col justify-between">
                  <div className="flex justify-end">
                    {slide.bubbleText && (
                      <div className="max-w-[70%]">
                        <HeroBubble text={slide.bubbleText} className="py-1 px-2.5 text-[11px]" />
                      </div>
                    )}
                  </div>

                  <div>
                    {slide.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-volt">
                        {slide.badge}
                      </span>
                    )}
                    <h4 className="font-display font-bold text-sm text-foreground line-clamp-1">
                      {slide.titleA} <span className="text-volt">{slide.titleB}</span>
                    </h4>
                  </div>
                </div>
              </div>

              {/* Text details */}
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <p className="line-clamp-2">{slide.sub}</p>
                {slide.bubbleText && (
                  <div className="flex items-center gap-1.5 text-volt font-medium pt-1">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Bubble: "{slide.bubbleText}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
              <Button size="sm" variant="outline" onClick={() => openEditDialog(slide)}>
                <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(slide.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog for Add/Edit Hero Slide */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Sparkles className="h-5 w-5 text-volt" />
              {editingSlide ? 'Edit Hero Media & Bubble' : 'Add New Hero Media'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="hero-media-type">Media Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: 'video' | 'image') =>
                    setFormData((prev) => ({ ...prev, type: val }))
                  }
                >
                  <SelectTrigger id="hero-media-type" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video (MP4 / WebM)</SelectItem>
                    <SelectItem value="image">Image (JPG / PNG / WebP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hero-upload">Upload File (Optional)</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <Input
                    id="hero-upload"
                    type="file"
                    accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="cursor-pointer text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="hero-url">Media URL / Source Path *</Label>
              <Input
                id="hero-url"
                required
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                placeholder={
                  formData.type === 'video' ? 'e.g. hero.mp4 or https://...' : 'https://images.unsplash.com/...'
                }
                className="mt-1.5 font-mono text-xs"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Enter a file path (like <code className="text-volt">hero.mp4</code>), an external media URL, or upload a file above.
              </p>
            </div>

            {/* Speech Bubble Text Input - Feature Requested */}
            <div className="rounded-lg border border-volt/30 bg-volt/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-volt font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Text Bubble (Speech Bubble Callout)</span>
              </div>
              <Label htmlFor="hero-bubble" className="text-xs">
                Floating Speech Bubble Text
              </Label>
              <Input
                id="hero-bubble"
                value={formData.bubbleText}
                onChange={(e) => setFormData((prev) => ({ ...prev, bubbleText: e.target.value }))}
                placeholder="e.g. 🔥 Fast 24h Express Delivery in Morocco on orders over 1000 DH!"
                className="bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                This text will appear in a stylized floating speech bubble overlay on top of the hero media.
              </p>
              {formData.bubbleText && (
                <div className="pt-2">
                  <span className="text-[11px] text-muted-foreground block mb-1">Live Bubble Preview:</span>
                  <HeroBubble text={formData.bubbleText} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="hero-badge">Badge Text</Label>
                <Input
                  id="hero-badge"
                  value={formData.badge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="NEW SEASON DROPS"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="hero-titleA">Title Line 1</Label>
                <Input
                  id="hero-titleA"
                  value={formData.titleA}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titleA: e.target.value }))}
                  placeholder="Tech that"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="hero-titleB">Title Line 2 (Highlighted)</Label>
                <Input
                  id="hero-titleB"
                  value={formData.titleB}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titleB: e.target.value }))}
                  placeholder="electrifies."
                  className="mt-1.5 font-bold text-volt"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hero-sub">Subtitle Description</Label>
              <Textarea
                id="hero-sub"
                rows={2}
                value={formData.sub}
                onChange={(e) => setFormData((prev) => ({ ...prev, sub: e.target.value }))}
                placeholder="Phones, laptops, audio and gaming gear..."
                className="mt-1.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="hero-ctaText">Button Text</Label>
                <Input
                  id="hero-ctaText"
                  value={formData.ctaText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                  placeholder="Shop now"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="hero-ctaLink">Button Link Target</Label>
                <Input
                  id="hero-ctaLink"
                  value={formData.ctaLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
                  placeholder="/shop"
                  className="mt-1.5 font-mono text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-volt text-volt-fg hover:bg-volt-dim">
                {editingSlide ? 'Update Hero Slide' : 'Add Hero Slide'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
