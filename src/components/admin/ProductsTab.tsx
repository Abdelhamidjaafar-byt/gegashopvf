import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase, isDemoMode } from '@/lib/supabase'
import { useProducts, useCategories, useBrands } from '@/hooks/useCatalog'
import { demoProducts } from '@/lib/demo-data'
import { fileToResizedDataUrl } from '@/lib/image'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types'
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

interface FormState {
  id?: string
  name: string
  description: string
  price: string
  stock: string
  category_id: string
  brand_id: string
  images: string[]
  specsText: string
  is_featured: boolean
}

const emptyForm: FormState = {
  name: '', description: '', price: '', stock: '', category_id: '', brand_id: '',
  images: [], specsText: '{}', is_featured: false,
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
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      category_id: p.category_id || '',
      brand_id: p.brand_id || '',
      images: [...p.images],
      specsText: JSON.stringify(p.specs || {}, null, 2),
      is_featured: p.is_featured,
    })
    setOpen(true)
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
    let specs: Record<string, string>
    try {
      specs = JSON.parse(form.specsText || '{}')
    } catch {
      toast.error(t('admin.specsHint'))
      return
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
    if (isDemoMode || !supabase) {
      if (form.id) {
        const i = demoProducts.findIndex((p) => p.id === form.id)
        if (i >= 0) demoProducts[i] = { ...demoProducts[i], ...payload }
      } else {
        demoProducts.unshift({ ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() } as Product)
      }
      toast.success(t('common.saved'))
    } else {
      const res = form.id
        ? await supabase.from('products').update(payload).eq('id', form.id)
        : await supabase.from('products').insert(payload)
      if (res.error) {
        toast.error(res.error.message)
        setSaving(false)
        return
      }
      toast.success(t('common.saved'))
    }
    setSaving(false)
    setOpen(false)
    refetch()
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    if (isDemoMode || !supabase) {
      const i = demoProducts.findIndex((p) => p.id === id)
      if (i >= 0) demoProducts.splice(i, 1)
    } else {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) {
        toast.error(error.message)
        return
      }
    }
    toast.success(t('common.deleted'))
    refetch()
  }

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
            <div className="sm:col-span-2">
              <Label>{t('admin.specs')}</Label>
              <Textarea
                rows={4}
                value={form.specsText}
                onChange={(e) => setForm({ ...form, specsText: e.target.value })}
                className="mt-1.5 bg-secondary font-mono text-xs"
                placeholder={t('admin.specsHint')}
              />
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
