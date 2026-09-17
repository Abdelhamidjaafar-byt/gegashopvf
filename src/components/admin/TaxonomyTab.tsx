import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useCategories, useBrands } from '@/hooks/useCatalog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const ROOT = '__root__'

export default function TaxonomyTab() {
  const { t } = useTranslation()
  const { categories, refetch: refetchCats } = useCategories()
  const { brands, refetch: refetchBrands } = useBrands()
  const [catName, setCatName] = useState('')
  const [catParent, setCatParent] = useState<string>(ROOT)
  const [brandName, setBrandName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'brand'; id: string } | null>(null)

  const roots = categories.filter((c) => !c.parent_id)

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const addCategory = async () => {
    if (!catName.trim()) return
    const parentId = catParent === ROOT ? null : catParent
    const { error } = await supabase.from('categories').insert({ name: catName.trim(), slug: slugify(catName), parent_id: parentId })
    if (error) {
      toast.error(error.message)
      return
    }
    setCatName('')
    toast.success(t('common.saved'))
    refetchCats()
  }

  const addBrand = async () => {
    if (!brandName.trim()) return
    const { error } = await supabase.from('brands').insert({ name: brandName.trim() })
    if (error) {
      toast.error(error.message)
      return
    }
    setBrandName('')
    toast.success(t('common.saved'))
    refetchBrands()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'category') {
      const { error } = await supabase.from('categories').delete().eq('id', deleteTarget.id)
      if (error) { toast.error(error.message); return }
      toast.success(t('common.deleted'))
      refetchCats()
    } else {
      const { error } = await supabase.from('brands').delete().eq('id', deleteTarget.id)
      if (error) { toast.error(error.message); return }
      toast.success(t('common.deleted'))
      refetchBrands()
    }
    setDeleteTarget(null)
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section>
        <h3 className="font-display text-lg font-bold">{t('nav.categories')}</h3>
        <div className="mt-4 flex gap-2">
          <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder={t('admin.categoryName')} className="bg-secondary" onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
          <Select value={catParent} onValueChange={setCatParent}>
            <SelectTrigger className="w-44 bg-secondary"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ROOT}>{t('admin.noParent')}</SelectItem>
              {roots.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addCategory} className="bg-volt text-volt-fg hover:bg-volt-dim"><Plus className="h-4 w-4" /></Button>
        </div>
        <ul className="mt-4 divide-y divide-border rounded-md border border-border">
          {roots.map((root) => (
            <li key={root.id}>
              <div className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <span className="text-sm font-semibold">{root.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">/{root.slug}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget({ type: 'category', id: root.id })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <ul>
                {categories.filter((c) => c.parent_id === root.id).map((child) => (
                  <li key={child.id} className="flex items-center justify-between border-t border-border/50 px-4 py-2 pl-8">
                    <div>
                      <span className="text-sm">{child.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">/{child.slug}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget({ type: 'category', id: child.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-display text-lg font-bold">{t('nav.brands')}</h3>
        <div className="mt-4 flex gap-2">
          <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder={t('admin.brandName')} className="bg-secondary" onKeyDown={(e) => e.key === 'Enter' && addBrand()} />
          <Button onClick={addBrand} className="bg-volt text-volt-fg hover:bg-volt-dim"><Plus className="h-4 w-4" /></Button>
        </div>
        <ul className="mt-4 divide-y divide-border rounded-md border border-border">
          {brands.map((b) => (
            <li key={b.id} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm font-medium">{b.name}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget({ type: 'brand', id: b.id })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              {t('admin.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
