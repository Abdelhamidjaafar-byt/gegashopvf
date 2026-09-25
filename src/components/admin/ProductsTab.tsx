import { useRef, useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Eye,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
  Package,
  Layers,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useProducts, useCategories, useBrands } from '@/hooks/useCatalog'
import { fileToResizedDataUrl } from '@/lib/image'
import { formatPrice, getProductUrl } from '@/lib/format'
import type { Category, Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
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
import { StockBadge } from '@/components/ProductCard'
import { useAuth } from '@/contexts/AuthContext'

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
  is_builder: boolean
  builder_slot: string
  socket: string
  watts: string
}

const emptyForm: FormState = {
  name: '', description: '', price: '', stock: '', category_id: '', brand_id: '',
  images: [], specsValues: {}, customSpecs: [], is_featured: false,
  is_builder: true, builder_slot: 'none', socket: '', watts: '',
}

type SortField = 'name' | 'category' | 'brand' | 'price' | 'stock' | 'created'

export default function ProductsTab() {
  const { t, i18n } = useTranslation()
  const { isAdmin } = useAuth()
  const { products, refetch } = useProducts()
  const { categories } = useCategories()
  const { brands } = useBrands()

  // Form & Modals State
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [previewImageIdx, setPreviewImageIdx] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // Search, Filtering, Sorting & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_desc')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Fast lookups for category & brand names
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
  const brandMap = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands])

  // Reset to Page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, pageSize])

  // Filter products by search query, category, and brand
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false
      }

      // Brand filter
      if (selectedBrand !== 'all' && p.brand_id !== selectedBrand) {
        return false
      }

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const nameMatch = p.name.toLowerCase().includes(q)
        const catName = p.category_id ? (categoryMap.get(p.category_id) || '').toLowerCase() : ''
        const brandName = p.brand_id ? (brandMap.get(p.brand_id) || '').toLowerCase() : ''
        const catMatch = catName.includes(q)
        const brandMatch = brandName.includes(q)
        const descMatch = (p.description || '').toLowerCase().includes(q)
        const specsMatch = Object.values(p.specs || {}).some((val) =>
          String(val).toLowerCase().includes(q)
        )

        if (!nameMatch && !catMatch && !brandMatch && !descMatch && !specsMatch) {
          return false
        }
      }

      return true
    })
  }, [products, searchQuery, selectedCategory, selectedBrand, categoryMap, brandMap])

  // Sort products based on sortBy key
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name)
        case 'name_desc':
          return b.name.localeCompare(a.name)
        case 'category_asc': {
          const catA = (a.category_id ? categoryMap.get(a.category_id) : '') || ''
          const catB = (b.category_id ? categoryMap.get(b.category_id) : '') || ''
          return catA.localeCompare(catB)
        }
        case 'category_desc': {
          const catA = (a.category_id ? categoryMap.get(a.category_id) : '') || ''
          const catB = (b.category_id ? categoryMap.get(b.category_id) : '') || ''
          return catB.localeCompare(catA)
        }
        case 'brand_asc': {
          const brandA = (a.brand_id ? brandMap.get(a.brand_id) : '') || ''
          const brandB = (b.brand_id ? brandMap.get(b.brand_id) : '') || ''
          return brandA.localeCompare(brandB)
        }
        case 'brand_desc': {
          const brandA = (a.brand_id ? brandMap.get(a.brand_id) : '') || ''
          const brandB = (b.brand_id ? brandMap.get(b.brand_id) : '') || ''
          return brandB.localeCompare(brandA)
        }
        case 'price_asc':
          return Number(a.price) - Number(b.price)
        case 'price_desc':
          return Number(b.price) - Number(a.price)
        case 'stock_asc':
          return a.stock - b.stock
        case 'stock_desc':
          return b.stock - a.stock
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'created_desc':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
    return list
  }, [filteredProducts, sortBy, categoryMap, brandMap])

  // Pagination calculation
  const totalProducts = sortedProducts.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalProducts)
  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice(startIndex, endIndex)
  }, [sortedProducts, startIndex, endIndex])

  // Toggle table header sort
  const handleHeaderSort = (field: SortField) => {
    if (field === 'name') {
      setSortBy((prev) => (prev === 'name_asc' ? 'name_desc' : 'name_asc'))
    } else if (field === 'category') {
      setSortBy((prev) => (prev === 'category_asc' ? 'category_desc' : 'category_asc'))
    } else if (field === 'brand') {
      setSortBy((prev) => (prev === 'brand_asc' ? 'brand_desc' : 'brand_asc'))
    } else if (field === 'price') {
      setSortBy((prev) => (prev === 'price_asc' ? 'price_desc' : 'price_asc'))
    } else if (field === 'stock') {
      setSortBy((prev) => (prev === 'stock_desc' ? 'stock_asc' : 'stock_desc'))
    }
  }

  const getSortHeaderIcon = (field: SortField) => {
    if (sortBy.startsWith(field)) {
      return sortBy.endsWith('_asc') ? (
        <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-volt" />
      ) : (
        <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-volt" />
      )
    }
    return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30 group-hover:opacity-100" />
  }

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

    const builderSlot = p.specs?.['PC Builder Slot'] || p.specs?.builder_slot || 'none'
    const isBuilderStr = String(p.specs?.is_builder ?? p.specs?.is_builder_component ?? p.specs?.['PC Builder Component'] ?? '')
    const isBuilder =
      isBuilderStr === 'false' || builderSlot === 'none' || builderSlot === 'disabled'
        ? false
        : true

    const socketVal = p.specs?.['Socket'] || p.specs?.socket || ''
    const wattsVal = p.specs?.['Watts'] || p.specs?.watts || p.specs?.TDP || ''

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
      is_builder: isBuilder,
      builder_slot: builderSlot,
      socket: socketVal,
      watts: wattsVal,
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

    if (form.is_builder) {
      specs['is_builder'] = 'true'
      if (form.builder_slot && form.builder_slot !== 'none') {
        specs['PC Builder Slot'] = form.builder_slot
      } else {
        delete specs['PC Builder Slot']
        delete specs['builder_slot']
      }
    } else {
      specs['is_builder'] = 'false'
      specs['PC Builder Slot'] = 'none'
      specs['builder_slot'] = 'none'
    }

    if (form.socket && form.socket.trim()) {
      specs['Socket'] = form.socket.trim()
    }
    if (form.watts && form.watts.trim()) {
      specs['Watts'] = form.watts.trim()
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

  const confirmRemove = async () => {
    if (!deleteTargetId) return
    const { error } = await supabase.from('products').delete().eq('id', deleteTargetId)
    setDeleteTargetId(null)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(t('common.deleted'))
    refetch()
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedBrand('all')
    setSortBy('created_desc')
    setCurrentPage(1)
  }

  const currentCategorySpecs = getStaticSpecsForCategory(form.category_id, categories)
  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedBrand !== 'all'

  return (
    <div className="space-y-4">
      
      {/* 1. TOP CONTROL BAR: SEARCH, FILTERS, ORDER BY, ADD BUTTON */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        
        {/* Left Side: Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.searchPlaceholder', 'Search by product name, category, or brand...')}
            className="pl-9 pr-8 bg-secondary border-border focus-visible:ring-volt text-xs h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Filters & Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px] bg-secondary text-xs h-9">
              <SelectValue placeholder={t('admin.filterByCategory', 'Category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allCategories', 'All Categories')}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand Filter */}
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[140px] bg-secondary text-xs h-9">
              <SelectValue placeholder={t('admin.filterByBrand', 'Brand')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allBrands', 'All Brands')}</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id} className="text-xs">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Order By Selector */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[170px] bg-secondary text-xs h-9">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-volt" />
              <SelectValue placeholder={t('admin.sortBy', 'Sort by')} />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="created_desc" className="text-xs">{t('admin.newest', 'Newest First')}</SelectItem>
              <SelectItem value="created_asc" className="text-xs">{t('admin.oldest', 'Oldest First')}</SelectItem>
              <SelectItem value="name_asc" className="text-xs">{t('admin.nameAsc', 'Name (A–Z)')}</SelectItem>
              <SelectItem value="name_desc" className="text-xs">{t('admin.nameDesc', 'Name (Z–A)')}</SelectItem>
              <SelectItem value="category_asc" className="text-xs">{t('admin.categoryAsc', 'Category (A–Z)')}</SelectItem>
              <SelectItem value="brand_asc" className="text-xs">{t('admin.brandAsc', 'Brand (A–Z)')}</SelectItem>
              <SelectItem value="price_asc" className="text-xs">{t('admin.priceAsc', 'Price (Low to High)')}</SelectItem>
              <SelectItem value="price_desc" className="text-xs">{t('admin.priceDesc', 'Price (High to Low)')}</SelectItem>
              <SelectItem value="stock_desc" className="text-xs">{t('admin.stockDesc', 'Stock (High to Low)')}</SelectItem>
              <SelectItem value="stock_asc" className="text-xs">{t('admin.stockAsc', 'Stock (Low to High)')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters button if filtered */}
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title={t('admin.clearFilters', 'Reset Filters')}
            >
              <X className="h-3.5 w-3.5 mr-1 text-volt" /> {t('admin.clearFilters', 'Reset')}
            </Button>
          )}

          {/* Add Product Button */}
          <Button onClick={openNew} className="bg-volt font-bold text-volt-fg hover:bg-volt-dim h-9 text-xs">
            <Plus className="mr-1.5 h-4 w-4" /> {t('admin.addProduct')}
          </Button>

        </div>

      </div>

      {/* 2. SUMMARY COUNTER BAR & PAGE SIZE SELECTOR */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-card text-foreground border-border font-bold">
            <Package className="mr-1 h-3.5 w-3.5 text-volt" />
            {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
          </Badge>
          {isFiltered && (
            <span className="text-[11px]">
              (Filtered from <span className="font-semibold text-foreground">{products.length}</span> total)
            </span>
          )}
          {totalProducts > 0 && (
            <span className="hidden md:inline text-[11px] text-muted-foreground">
              · Showing <span className="font-semibold text-foreground">{startIndex + 1}</span>–<span className="font-semibold text-foreground">{endIndex}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>{t('admin.perPage', 'per page')}:</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[70px] h-7 bg-card border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="10" className="text-xs">10</SelectItem>
              <SelectItem value="25" className="text-xs">25</SelectItem>
              <SelectItem value="50" className="text-xs">50</SelectItem>
              <SelectItem value="100" className="text-xs">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. PRODUCTS DATA TABLE */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14"></TableHead>

              {/* Product Name Column Sort */}
              <TableHead
                className="cursor-pointer font-bold text-foreground hover:text-volt transition-colors group select-none"
                onClick={() => handleHeaderSort('name')}
              >
                {t('admin.name')} {getSortHeaderIcon('name')}
              </TableHead>

              {/* Category Column Sort */}
              <TableHead
                className="cursor-pointer font-bold text-foreground hover:text-volt transition-colors group select-none"
                onClick={() => handleHeaderSort('category')}
              >
                <div className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('admin.category')} {getSortHeaderIcon('category')}
                </div>
              </TableHead>

              {/* Brand Column Sort */}
              <TableHead
                className="cursor-pointer font-bold text-foreground hover:text-volt transition-colors group select-none"
                onClick={() => handleHeaderSort('brand')}
              >
                <div className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('admin.brand')} {getSortHeaderIcon('brand')}
                </div>
              </TableHead>

              {/* Price Column Sort */}
              <TableHead
                className="cursor-pointer font-bold text-foreground hover:text-volt transition-colors group select-none"
                onClick={() => handleHeaderSort('price')}
              >
                {t('admin.price')} {getSortHeaderIcon('price')}
              </TableHead>

              {/* Stock Column Sort */}
              <TableHead
                className="cursor-pointer font-bold text-foreground hover:text-volt transition-colors group select-none"
                onClick={() => handleHeaderSort('stock')}
              >
                {t('admin.stock')} {getSortHeaderIcon('stock')}
              </TableHead>

              <TableHead className="w-28 text-right pr-4 font-bold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-semibold text-sm text-foreground">
                      {t('admin.noProductsFound', 'No products match your search or filter criteria.')}
                    </p>
                    {isFiltered && (
                      <Button variant="outline" size="sm" onClick={resetFilters} className="mt-1 text-xs">
                        {t('admin.clearFilters', 'Reset Filters')}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((p) => {
                const categoryName = p.category_id ? categoryMap.get(p.category_id) : undefined
                const brandName = p.brand_id ? brandMap.get(p.brand_id) : undefined

                return (
                  <TableRow
                    key={p.id}
                    onClick={() => {
                      setPreviewProduct(p)
                      setPreviewImageIdx(0)
                    }}
                    className="cursor-pointer hover:bg-secondary/60 transition-colors"
                  >
                    {/* Thumbnail Image */}
                    <TableCell className="py-2.5">
                      <div className="h-11 w-11 overflow-hidden rounded-md border border-border bg-secondary flex items-center justify-center">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-contain p-0.5" />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </TableCell>

                    {/* Product Name & Featured Star */}
                    <TableCell className="font-semibold text-xs py-2.5 max-w-[240px]">
                      <div className="line-clamp-2 leading-tight">
                        {p.name}
                        {p.is_featured && (
                          <span className="ml-1.5 inline-flex items-center rounded bg-volt/20 px-1.5 py-0.2 text-[10px] font-extrabold text-volt border border-volt/40">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-2.5 text-xs">
                      {categoryName ? (
                        <Badge variant="secondary" className="font-semibold text-[11px]">
                          {categoryName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/50 text-[11px]">—</span>
                      )}
                    </TableCell>

                    {/* Brand */}
                    <TableCell className="py-2.5 text-xs">
                      {brandName ? (
                        <Badge variant="outline" className="font-semibold text-[11px] border-border/80">
                          {brandName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/50 text-[11px]">—</span>
                      )}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-display font-extrabold text-volt text-xs py-2.5">
                      {formatPrice(Number(p.price), i18n.language)}
                    </TableCell>

                    {/* Stock Status Badge */}
                    <TableCell className="py-2.5">
                      <StockBadge stock={p.stock} />
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="py-2.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setPreviewProduct(p)
                            setPreviewImageIdx(0)
                          }}
                          title={t('admin.previewProduct')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-volt"
                          onClick={() => openEdit(p)}
                          title={t('admin.edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTargetId(p.id)}
                            title={t('admin.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 4. PAGINATION FOOTER CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-3 shadow-sm text-xs">
          <div className="text-muted-foreground text-center sm:text-left">
            {t('admin.page', { current: safePage, total: totalPages })}
            <span className="ml-2 font-medium text-foreground">
              ({startIndex + 1}–{endIndex} of {totalProducts})
            </span>
          </div>

          <div className="flex items-center justify-center gap-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1
              // Show limited page buttons around current page
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= safePage - 1 && pageNum <= safePage + 1)
              ) {
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === safePage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 min-w-8 text-xs font-bold ${
                      pageNum === safePage ? 'bg-volt text-volt-fg hover:bg-volt-dim' : ''
                    }`}
                  >
                    {pageNum}
                  </Button>
                )
              }
              if (pageNum === safePage - 2 || pageNum === safePage + 2) {
                return <span key={pageNum} className="px-1 text-muted-foreground">...</span>
              }
              return null
            })}

            {/* Next Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Edit / Add Dialog */}
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

            {/* Category Static Specs + Custom Key-Value Specs */}
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

            {/* PC Builder Component Option */}
            <div className="sm:col-span-2 rounded-xl border border-volt/30 bg-volt/5 p-4 transition-all hover:border-volt/50">
              <label htmlFor="is_builder_checkbox" className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id="is_builder_checkbox"
                  type="checkbox"
                  checked={form.is_builder}
                  onChange={(e) => setForm({ ...form, is_builder: e.target.checked })}
                  className="mt-0.5 h-5 w-5 rounded border-border text-volt focus:ring-volt cursor-pointer accent-[#d1a65b]"
                />
                <div className="space-y-1">
                  <span className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-volt" />
                    Component for PC Builder
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Check this box if this product is a PC component (CPU, GPU, RAM, Motherboard, Storage, PSU, Case, Cooler) that customers can select when building a custom PC.
                  </p>
                </div>
              </label>
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

      {/* Product Preview Modal */}
      <Dialog open={Boolean(previewProduct)} onOpenChange={(o) => !o && setPreviewProduct(null)}>
        {previewProduct && (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4 pr-6">
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-volt" />
                  {t('admin.previewProduct')}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prod = previewProduct
                      setPreviewProduct(null)
                      openEdit(prod)
                    }}
                    className="h-8 text-xs font-semibold"
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    {t('admin.edit')}
                  </Button>
                  <Button variant="secondary" size="sm" asChild className="h-8 text-xs font-semibold">
                    <Link to={getProductUrl(previewProduct)} target="_blank">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      {t('admin.viewInStore')}
                    </Link>
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-2 mt-2">
              {/* Gallery */}
              <div>
                <div className="aspect-square overflow-hidden rounded-md border border-border bg-secondary">
                  {previewProduct.images[previewImageIdx] ? (
                    <img
                      src={previewProduct.images[previewImageIdx]}
                      alt={previewProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-4xl font-bold text-muted-foreground/30">
                      {previewProduct.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                {previewProduct.images.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {previewProduct.images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setPreviewImageIdx(i)}
                        className={`h-14 w-14 shrink-0 overflow-hidden rounded border transition-colors ${
                          i === previewImageIdx ? 'border-volt ring-1 ring-volt' : 'border-border'
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {brands.find((b) => b.id === previewProduct.brand_id)?.name}
                    {previewProduct.category_id &&
                      ` · ${categories.find((c) => c.id === previewProduct.category_id)?.name}`}
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold">{previewProduct.name}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl font-bold text-volt">
                    {formatPrice(Number(previewProduct.price), i18n.language)}
                  </span>
                  <StockBadge stock={previewProduct.stock} />
                  {previewProduct.is_featured && (
                    <span className="rounded-full bg-volt/20 px-2 py-0.5 text-xs font-semibold text-volt border border-volt/40">
                      ★ {t('admin.featured')}
                    </span>
                  )}
                </div>

                {previewProduct.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground bg-secondary/30 p-3 rounded-md border border-border/50">
                    {previewProduct.description}
                  </p>
                )}

                {/* Specs */}
                {Object.keys(previewProduct.specs || {}).length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      {t('admin.specs')}
                    </h4>
                    <div className="max-h-48 overflow-y-auto rounded-md border border-border divide-y divide-border text-xs bg-secondary/20">
                      {Object.entries(previewProduct.specs).map(([k, v]) => (
                        <div key={k} className="grid grid-cols-3 gap-2 px-3 py-1.5">
                          <span className="font-semibold text-foreground/80">{k}</span>
                          <span className="col-span-2 text-muted-foreground tabular-nums">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Alert Pop-Up */}
      <AlertDialog open={Boolean(deleteTargetId)} onOpenChange={(o) => !o && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
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
