import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useProducts, useCategories, useBrands } from '@/hooks/useCatalog'
import { fileToResizedDataUrl } from '@/lib/image'
import { formatPrice } from '@/lib/format'
import type { Category, Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const CATEGORY_STATIC_SPECS: Record<string, string[]> = {
  laptops: ['Processeur (CPU)', 'Carte Graphique (GPU)', 'Mémoire RAM', 'Stockage (SSD/HDD)', 'Écran', 'Système d\'exploitation', 'Batterie', 'Poids', 'Garantie'],
  computers: ['Processeur (CPU)', 'Carte Graphique (GPU)', 'Mémoire RAM', 'Stockage (SSD/HDD)', 'Écran', 'Système d\'exploitation', 'Batterie', 'Poids', 'Garantie'],
  pc: ['Processeur (CPU)', 'Carte Graphique (GPU)', 'Mémoire RAM', 'Stockage (SSD/HDD)', 'Écran', 'Système d\'exploitation', 'Batterie', 'Poids', 'Garantie'],
  phones: ['Écran', 'Processeur', 'Mémoire RAM', 'Stockage', 'Appareil Photo Principal', 'Appareil Photo Frontal', 'Batterie', 'Système d\'exploitation', 'Réseau & SIM', 'Garantie'],
  smartphones: ['Écran', 'Processeur', 'Mémoire RAM', 'Stockage', 'Appareil Photo Principal', 'Appareil Photo Frontal', 'Batterie', 'Système d\'exploitation', 'Réseau & SIM', 'Garantie'],
  tablets: ['Écran', 'Processeur', 'Mémoire RAM', 'Stockage', 'Appareil Photo Principal', 'Appareil Photo Frontal', 'Batterie', 'Système d\'exploitation', 'Réseau & SIM', 'Garantie'],
  components: ['Socket / Compatibilité', 'Vitesse / Fréquence', 'Format (Form Factor)', 'Consommation (TDP)', 'Interface / Connectique', 'Garantie'],
  composants: ['Socket / Compatibilité', 'Vitesse / Fréquence', 'Format (Form Factor)', 'Consommation (TDP)', 'Interface / Connectique', 'Garantie'],
  cpus: ['Socket / Compatibilité', 'Nombre de cœurs / Threads', 'Fréquence Base / Boost', 'Cache', 'Consommation (TDP)', 'Garantie'],
  gpus: ['Mémoire VRAM', 'Interface / Bus', 'Connecteurs d\'alimentation', 'Puissance conseillée (PSU)', 'Connectiques Vidéo', 'Garantie'],
  ram: ['Capacité', 'Technologie (DDR4/DDR5)', 'Fréquence (MHz)', 'Cas Latency (CL)', 'Garantie'],
  storage: ['Type (NVMe SSD / SATA / HDD)', 'Capacité', 'Vitesse Lecture / Écriture', 'Format', 'Garantie'],
  audio: ['Type', 'Connectivité (Bluetooth/Filaire)', 'Autonomie Batterie', 'Réduction de bruit (ANC)', 'Réponse en fréquence', 'Garantie'],
  casques: ['Type', 'Connectivité (Bluetooth/Filaire)', 'Autonomie Batterie', 'Réduction de bruit (ANC)', 'Réponse en fréquence', 'Garantie'],
  gaming: ['Type de connexion', 'Capteur / DPI', 'Switchs (Clavier)', 'Éclairage RGB', 'Compatibilité', 'Garantie'],
  accessories: ['Type de connexion', 'Capteur / DPI', 'Switchs (Clavier)', 'Éclairage RGB', 'Compatibilité', 'Garantie'],
  default: ['Couleur', 'Dimensions', 'Poids', 'Garantie'],
}

function getStaticSpecsForCategory(categoryId: string, categories: Category[]): string[] {
  if (!categoryId) return CATEGORY_STATIC_SPECS.default
  const cat = categories.find((c) => c.id === categoryId)
  if (!cat) return CATEGORY_STATIC_SPECS.default

  const slugName = (cat.slug + ' ' + cat.name).toLowerCase()
  for (const key of Object.keys(CATEGORY_STATIC_SPECS)) {
    if (key !== 'default' && slugName.includes(key)) {
      return CATEGORY_STATIC_SPECS[key]
    }
  }

  if (cat.parent_id) {
    const parent = categories.find((c) => c.id === cat.parent_id)
    if (parent) {
      const parentSlugName = (parent.slug + ' ' + parent.name).toLowerCase()
      for (const key of Object.keys(CATEGORY_STATIC_SPECS)) {
        if (key !== 'default' && parentSlugName.includes(key)) {
          return CATEGORY_STATIC_SPECS[key]
        }
      }
    }
  }

  return CATEGORY_STATIC_SPECS.default
}

interface CustomSpecItem {
  id: string
  key: string
  value: string
}

interface FormState {
  id?: string
  name: string
  description: string
  price: string
  stock: string
  category_id: string
  brand_id: string
  images: string[]
  specsValues: Record<string, string>
  customSpecs: CustomSpecItem[]
  is_featured: boolean
}

const emptyForm: FormState = {
  name: '', description: '', price: '', stock: '', category_id: '', brand_id: '',
  images: [], specsValues: {}, customSpecs: [], is_featured: false,
}

export default function ProductsTab() {
  const { t, i18n } = useTranslation()
  const { products, refetch } = useProducts()
  const { categories } = useCategories()
  const { brands } = useBrands()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const openNew = () => {
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (p: Product) => {
    const existingSpecs = p.specs || {}
    const categoryStatic = getStaticSpecsForCategory(p.category_id || '', categories)
    const categorySet = new Set(categoryStatic)

    const specsValues: Record<string, string> = {}
    const customSpecs: CustomSpecItem[] = []

    for (const [k, v] of Object.entries(existingSpecs)) {
      if (categorySet.has(k)) {
        specsValues[k] = v
      } else {
        customSpecs.push({
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          key: k,
          value: v,
        })
      }
    }

    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      category_id: p.category_id || '',
      brand_id: p.brand_id || '',
      images: [...p.images],
      specsValues,
      customSpecs,
      is_featured: p.is_featured,
    })
    setOpen(true)
  }

  const addCustomSpecRow = () => {
    setForm((f) => ({
      ...f,
      customSpecs: [
        ...f.customSpecs,
        {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          key: '',
          value: '',
        },
      ],
    }))
  }

  const updateCustomSpecRow = (id: string, field: 'key' | 'value', val: string) => {
    setForm((f) => ({
      ...f,
      customSpecs: f.customSpecs.map((item) => (item.id === id ? { ...item, [field]: val } : item)),
    }))
  }

  const removeCustomSpecRow = (id: string) => {
    setForm((f) => ({
      ...f,
      customSpecs: f.customSpecs.filter((item) => item.id !== id),
    }))
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setForm((f) => ({ ...f, images: [...f.images, dataUrl] }))
    } catch {
      toast.error(t('common.error'))
    }
    e.target.value = ''
  }

  const save = async () => {
    const specs: Record<string, string> = {}
    for (const [k, v] of Object.entries(form.specsValues)) {
      if (v && v.trim()) {
        specs[k] = v.trim()
      }
    }
    for (const item of form.customSpecs) {
      if (item.key && item.key.trim() && item.value && item.value.trim()) {
        specs[item.key.trim()] = item.value.trim()
      }
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      images: form.images,
      specs,
      is_featured: form.is_featured,
    }
    setSaving(true)
    const res = form.id
      ? await supabase.from('products').update(payload).eq('id', form.id)
      : await supabase.from('products').insert(payload)
    if (res.error) {
      toast.error(res.error.message)
      setSaving(false)
      return
    }
    toast.success(t('common.saved'))
    setSaving(false)
    setOpen(false)
    refetch()
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(t('common.deleted'))
    refetch()
  }

  const currentCategorySpecs = getStaticSpecsForCategory(form.category_id, categories)

  return (
    <div>
      <Button onClick={openNew} className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
        <Plus className="mr-2 h-4 w-4" /> {t('admin.addProduct')}
      </Button>

      <div className="mt-6 overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>{t('admin.name')}</TableHead>
              <TableHead>{t('admin.price')}</TableHead>
              <TableHead>{t('admin.stock')}</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="h-10 w-10 overflow-hidden rounded bg-secondary">
                    {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {p.name}
                  {p.is_featured && <span className="ml-2 text-volt">★</span>}
                </TableCell>
                <TableCell>{formatPrice(Number(p.price), i18n.language)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? t('admin.editProduct') : t('admin.addProduct')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>{t('admin.name')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label>{t('admin.price')}</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label>{t('admin.stock')}</Label>
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label>{t('admin.category')}</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger className="mt-1.5 bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => !c.parent_id).map((root) => {
                    const children = categories.filter((c) => c.parent_id === root.id)
                    return (
                      <SelectGroup key={root.id}>
                        <SelectItem value={root.id} className="font-semibold">{root.name}</SelectItem>
                        {children.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="pl-7">{c.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('admin.brand')}</Label>
              <Select value={form.brand_id} onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                <SelectTrigger className="mt-1.5 bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>{t('admin.description')}</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 bg-secondary" />
            </div>

            {/* Category Static Specs + Additional Custom Key-Value Specs */}
            <div className="sm:col-span-2 rounded-md border border-border bg-secondary/30 p-4 space-y-4">
              <div>
                <Label className="font-display font-bold text-sm">{t('admin.specs')}</Label>
                <p className="text-xs text-muted-foreground">{t('admin.specsSub')}</p>
              </div>

              {/* Standard Category Specs Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {currentCategorySpecs.map((specKey) => (
                  <div key={specKey}>
                    <Label htmlFor={`spec-${specKey}`} className="text-xs font-semibold text-foreground">{specKey}</Label>
                    <Input
                      id={`spec-${specKey}`}
                      value={form.specsValues[specKey] || ''}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        specsValues: { ...f.specsValues, [specKey]: e.target.value }
                      }))}
                      placeholder="..."
                      className="mt-1 bg-background text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Custom Additional Specifications Section */}
              <div className="pt-3 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground/90">{t('admin.customSpecs')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomSpecRow}
                    className="h-7 text-xs font-semibold"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    {t('admin.addCustomSpec')}
                  </Button>
                </div>

                {form.customSpecs.length > 0 && (
                  <div className="space-y-2">
                    {form.customSpecs.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Input
                          value={item.key}
                          onChange={(e) => updateCustomSpecRow(item.id, 'key', e.target.value)}
                          placeholder={t('admin.specKeyPlaceholder')}
                          className="w-1/2 bg-background text-xs"
                        />
                        <Input
                          value={item.value}
                          onChange={(e) => updateCustomSpecRow(item.id, 'value', e.target.value)}
                          placeholder={t('admin.specValuePlaceholder')}
                          className="w-1/2 bg-background text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomSpecRow(item.id)}
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          title={t('admin.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label>{t('admin.images')}</Label>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                {form.images.map((src, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded border border-border">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                      className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> {t('admin.uploadImage')}
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{t('admin.imageHint')}</p>
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <Checkbox checked={form.is_featured} onCheckedChange={(c) => setForm({ ...form, is_featured: Boolean(c) })} />
              {t('admin.featured')}
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={save} disabled={saving || !form.name || !form.price} className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
              {t('admin.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
