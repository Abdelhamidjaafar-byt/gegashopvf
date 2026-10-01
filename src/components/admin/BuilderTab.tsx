import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import {
  SlidersHorizontal,
  Power,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  AlertTriangle,
  Cpu,
  Fan,
  CircuitBoard,
  Layers,
  Sparkles,
  HardDrive,
  Zap,
  Box,
  Pencil,
  Eye,
  Upload,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { useProducts, useCategories, useBrands } from '@/hooks/useCatalog'
import { useBuilderSettings } from '@/hooks/useBuilderSettings'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/format'
import { fileToResizedDataUrl } from '@/lib/image'
import type { Product } from '@/types'
import type { SlotId } from '@/lib/builder-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const SLOTS: Array<{ id: SlotId; label: string; icon: any }> = [
  { id: 'cpu', label: 'Processeur (CPU)', icon: Cpu },
  { id: 'cooler', label: 'Refroidissement (Cooler)', icon: Fan },
  { id: 'motherboard', label: 'Carte Mère (Mobo)', icon: CircuitBoard },
  { id: 'ram', label: 'Mémoire (RAM)', icon: Layers },
  { id: 'gpu', label: 'Carte Graphique (GPU)', icon: Sparkles },
  { id: 'storage', label: 'Stockage (SSD / HDD)', icon: HardDrive },
  { id: 'psu', label: 'Alimentation (PSU)', icon: Zap },
  { id: 'case', label: 'Boîtier PC (Case)', icon: Box },
]

export default function BuilderTab() {
  const { products, refetch } = useProducts()
  const { categories } = useCategories()
  const { brands } = useBrands()
  const { enabled, setBuilderEnabled, loading: settingsLoading } = useBuilderSettings()

  // Slot filter in components table
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Add / Edit component modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [addMode, setAddMode] = useState<'select' | 'new'>('select')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [productSearch, setProductSearch] = useState('')
  const [builderSlot, setBuilderSlot] = useState<SlotId>('cpu')
  const [socket, setSocket] = useState('')
  const [watts, setWatts] = useState('')
  const [saving, setSaving] = useState(false)

  // New product form state
  const [newProdName, setNewProdName] = useState('')
  const [newProdPrice, setNewProdPrice] = useState('')
  const [newProdStock, setNewProdStock] = useState('10')
  const [newProdCategoryId, setNewProdCategoryId] = useState('')
  const [newProdBrandId, setNewProdBrandId] = useState('')
  const [newProdImage, setNewProdImage] = useState('')
  const [newProdDesc, setNewProdDesc] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Category map
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])

  // Products configured for builder
  const builderProducts = useMemo(() => {
    return products.filter((p) => {
      const slot = (p.specs?.['BUILDER_SLOT'] || p.specs?.['builder_slot'] || p.specs?.['PC Builder Slot'] || '').toLowerCase()
      const isBuilder = String(p.specs?.['IS_BUILDER'] ?? p.specs?.is_builder ?? '')
      return (slot && slot !== 'none' && slot !== 'disabled') || isBuilder === 'true'
    })
  }, [products])

  // Count by slot
  const slotCounts = useMemo(() => {
    const counts: Record<SlotId, number> = {
      cpu: 0, cooler: 0, motherboard: 0, ram: 0, gpu: 0, storage: 0, psu: 0, case: 0
    }
    for (const p of builderProducts) {
      const slot = (p.specs?.['BUILDER_SLOT'] || p.specs?.['builder_slot'] || p.specs?.['PC Builder Slot'] || '').toLowerCase() as SlotId
      if (counts[slot] !== undefined) {
        counts[slot]++
      }
    }
    return counts
  }, [builderProducts])

  // Filtered components
  const filteredProducts = useMemo(() => {
    return builderProducts.filter((p) => {
      const slot = (p.specs?.['BUILDER_SLOT'] || p.specs?.['builder_slot'] || p.specs?.['PC Builder Slot'] || '').toLowerCase()
      if (selectedSlotFilter !== 'all' && slot !== selectedSlotFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return p.name.toLowerCase().includes(q) || slot.includes(q)
      }
      return true
    })
  }, [builderProducts, selectedSlotFilter, searchQuery])

  // Candidate products for select dropdown
  const candidateProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, productSearch])

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId],
  )

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setAddMode('select')
    setSelectedProductId(products[0]?.id || '')
    setProductSearch('')
    setBuilderSlot('cpu')
    setSocket('')
    setWatts('')
    setNewProdName('')
    setNewProdPrice('')
    setNewProdStock('10')
    setNewProdCategoryId(categories[0]?.id || '')
    setNewProdBrandId('')
    setNewProdImage('')
    setNewProdDesc('')
    setIsModalOpen(true)
  }

  // Open edit modal for an existing builder product
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p)
    setSelectedProductId(p.id)
    const slot = (p.specs?.['BUILDER_SLOT'] || p.specs?.['builder_slot'] || p.specs?.['PC Builder Slot'] || 'cpu').toLowerCase() as SlotId
    setBuilderSlot(slot)
    setSocket(p.specs?.['SOCKET'] || p.specs?.['Socket'] || p.specs?.socket || '')
    setWatts(p.specs?.['WATTS'] || p.specs?.['Watts'] || p.specs?.watts || '')
    setIsModalOpen(true)
  }

  // Save component to builder
  const handleSaveComponent = async () => {
    setSaving(true)
    try {
      if (editingProduct) {
        // Updating existing builder component
        const currentSpecs = { ...(editingProduct.specs || {}) }
        currentSpecs['BUILDER_SLOT'] = builderSlot.toLowerCase()
        currentSpecs['IS_BUILDER'] = 'true'

        if (socket.trim()) {
          currentSpecs['SOCKET'] = socket.trim().toUpperCase()
        } else {
          delete currentSpecs['SOCKET']
          delete currentSpecs['Socket']
        }

        if (watts.trim()) {
          currentSpecs['WATTS'] = watts.trim()
        } else {
          delete currentSpecs['WATTS']
          delete currentSpecs['Watts']
        }

        const { error } = await supabase
          .from('products')
          .update({ specs: currentSpecs })
          .eq('id', editingProduct.id)

        if (error) throw error

        toast.success('Composant mis à jour avec succès')
      } else if (addMode === 'select') {
        // Selecting existing product from catalog
        const targetProduct = products.find((p) => p.id === selectedProductId)
        if (!targetProduct) {
          toast.error('Veuillez sélectionner un produit')
          setSaving(false)
          return
        }

        const currentSpecs = { ...(targetProduct.specs || {}) }
        currentSpecs['BUILDER_SLOT'] = builderSlot.toLowerCase()
        currentSpecs['IS_BUILDER'] = 'true'

        if (socket.trim()) {
          currentSpecs['SOCKET'] = socket.trim().toUpperCase()
        } else {
          delete currentSpecs['SOCKET']
          delete currentSpecs['Socket']
        }

        if (watts.trim()) {
          currentSpecs['WATTS'] = watts.trim()
        } else {
          delete currentSpecs['WATTS']
          delete currentSpecs['Watts']
        }

        const { error } = await supabase
          .from('products')
          .update({ specs: currentSpecs })
          .eq('id', targetProduct.id)

        if (error) throw error

        toast.success(`Produit "${targetProduct.name}" ajouté au Configurateur PC`)
      } else {
        // Creating brand new product and assigning to builder
        if (!newProdName.trim()) {
          toast.error('Veuillez indiquer le nom du produit')
          setSaving(false)
          return
        }
        const priceNum = Number(newProdPrice)
        if (isNaN(priceNum) || priceNum < 0 || !newProdPrice) {
          toast.error('Veuillez indiquer un prix valide')
          setSaving(false)
          return
        }

        const newSpecs: Record<string, string> = {
          BUILDER_SLOT: builderSlot.toLowerCase(),
          IS_BUILDER: 'true',
        }
        if (socket.trim()) newSpecs['SOCKET'] = socket.trim().toUpperCase()
        if (watts.trim()) newSpecs['WATTS'] = watts.trim()

        const images = newProdImage.trim() ? [newProdImage.trim()] : []

        const { error } = await supabase.from('products').insert({
          name: newProdName.trim(),
          description: newProdDesc.trim() || '',
          price: priceNum,
          stock: Number(newProdStock) || 10,
          category_id: newProdCategoryId || null,
          brand_id: newProdBrandId || null,
          images,
          specs: newSpecs,
          is_featured: false,
        })

        if (error) throw error

        toast.success(`Nouveau produit "${newProdName}" créé et ajouté au Configurateur PC !`)
      }

      setIsModalOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // Remove component from builder
  const handleRemoveFromBuilder = async (p: Product) => {
    try {
      const currentSpecs = { ...(p.specs || {}) }
      delete currentSpecs['BUILDER_SLOT']
      delete currentSpecs['builder_slot']
      delete currentSpecs['PC Builder Slot']
      delete currentSpecs['IS_BUILDER']
      delete currentSpecs['is_builder']

      const { error } = await supabase
        .from('products')
        .update({ specs: currentSpecs })
        .eq('id', p.id)

      if (error) throw error

      toast.success(`"${p.name}" retiré du Configurateur PC`)
      refetch()
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la suppression')
    }
  }

  // Empty slots check
  const emptySlots = useMemo(() => {
    return SLOTS.filter((s) => slotCounts[s.id] === 0)
  }, [slotCounts])

  return (
    <div className="space-y-6">
      {/* 1. STATUS & VISIBILITY CONTROL BANNER */}
      <div className="rounded-2xl border border-volt/40 bg-gradient-to-br from-card via-card to-volt/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt/15 text-volt">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Statut du Configurateur PC (PC Builder)
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant={enabled ? 'default' : 'secondary'}
                    className={
                      enabled
                        ? 'bg-volt text-volt-fg font-extrabold uppercase text-[10px] tracking-wider'
                        : 'bg-muted text-muted-foreground font-bold uppercase text-[10px] tracking-wider'
                    }
                  >
                    {enabled ? '● En ligne & Visible sur le site' : '○ Masqué pour les visiteurs'}
                  </Badge>
                  {builderProducts.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({builderProducts.length} composant{builderProducts.length > 1 ? 's' : ''} configuré{builderProducts.length > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Activez ou désactivez le Configurateur PC à tout moment. Si vous n'avez pas assez de composants ou êtes en rupture de stock, basculez ce bouton sur "Masqué" pour retirer instantanément le bouton du Header, de l'Accueil et du Pied de page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Direct preview link */}
            <Button asChild variant="outline" size="sm" className="border-volt/40 text-volt hover:bg-volt/10 font-bold">
              <Link to="/builder" target="_blank" rel="noopener noreferrer">
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Prévisualiser (/builder)
                <ExternalLink className="ml-1.5 h-3 w-3" />
              </Link>
            </Button>

            {/* Toggle Status Switch */}
            <Button
              onClick={() => {
                const nextState = !enabled
                setBuilderEnabled(nextState)
                toast.success(
                  nextState
                    ? 'Le Configurateur PC est maintenant visible sur le site public'
                    : 'Le Configurateur PC a été masqué du site public'
                )
              }}
              disabled={settingsLoading}
              className={`font-bold transition-all shadow-md ${
                enabled
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-volt text-volt-fg hover:bg-volt-dim'
              }`}
            >
              <Power className="mr-2 h-4 w-4" />
              {enabled ? 'Masquer du Site' : 'Afficher sur le Site'}
            </Button>
          </div>
        </div>

        {/* Warning if builder is enabled but some slots have 0 products */}
        {enabled && emptySlots.length > 0 && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">
                Attention : {emptySlots.length} emplacement{emptySlots.length > 1 ? 's sont vides' : ' est vide'} dans le Configurateur PC :
              </p>
              <p className="mt-0.5 text-muted-foreground">
                {emptySlots.map((s) => s.label).join(' · ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. SLOTS BREAKDOWN SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {SLOTS.map((slot) => {
          const count = slotCounts[slot.id]
          const isSelected = selectedSlotFilter === slot.id
          const Icon = slot.icon

          return (
            <button
              key={slot.id}
              onClick={() => setSelectedSlotFilter(isSelected ? 'all' : slot.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-volt bg-volt/15 shadow-sm'
                  : count === 0
                  ? 'border-border/50 bg-card opacity-60 hover:opacity-100 hover:border-border'
                  : 'border-border bg-card hover:border-volt/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${count > 0 ? 'text-volt' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-black px-1.5 py-0.5 rounded ${count > 0 ? 'bg-volt/20 text-volt' : 'bg-muted text-muted-foreground'}`}>
                  {count}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-[11px] font-bold text-foreground truncate">{slot.label.split(' ')[0]}</div>
                <div className="text-[9px] text-muted-foreground uppercase">{slot.id}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 3. CONTROLS BAR: SEARCH, FILTER, AND ADD BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher parmi les composants configurés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
          {selectedSlotFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSlotFilter('all')}
              className="text-xs h-9 text-muted-foreground hover:text-foreground"
            >
              Réinitialiser ({selectedSlotFilter})
            </Button>
          )}
        </div>

        <Button onClick={handleOpenAddModal} className="bg-volt text-volt-fg hover:bg-volt-dim font-bold h-9 text-xs shadow-md">
          <Plus className="mr-1.5 h-4 w-4" />
          Ajouter un composant au Configurateur
        </Button>
      </div>

      {/* 4. CONFIGURED COMPONENTS TABLE */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/40">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-bold">Composant</TableHead>
              <TableHead className="font-bold">Emplacement (Slot)</TableHead>
              <TableHead className="font-bold">Spécifications PC Builder</TableHead>
              <TableHead className="font-bold">Prix & Stock</TableHead>
              <TableHead className="text-right font-bold pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <SlidersHorizontal className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-semibold text-sm text-foreground">
                      Aucun composant configuré {selectedSlotFilter !== 'all' ? `pour le slot "${selectedSlotFilter}"` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Cliquez sur "Ajouter un composant au Configurateur" ci-dessus pour attribuer des pièces de votre catalogue au PC Builder.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => {
                const slot = (p.specs?.['BUILDER_SLOT'] || p.specs?.['builder_slot'] || p.specs?.['PC Builder Slot'] || '').toLowerCase()
                const socketVal = p.specs?.['SOCKET'] || p.specs?.['Socket'] || p.specs?.socket
                const wattsVal = p.specs?.['WATTS'] || p.specs?.['Watts'] || p.specs?.watts

                return (
                  <TableRow key={p.id} className="hover:bg-secondary/30 transition-colors">
                    {/* Thumbnail */}
                    <TableCell className="py-2.5">
                      <div className="h-11 w-11 rounded-md border border-border bg-secondary overflow-hidden flex items-center justify-center">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-contain p-0.5" />
                        ) : (
                          <SlidersHorizontal className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </TableCell>

                    {/* Name & Category */}
                    <TableCell className="py-2.5 max-w-xs">
                      <div className="font-semibold text-xs text-foreground line-clamp-1">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {p.category_id ? categoryMap.get(p.category_id) || 'Composant' : 'Composant'}
                      </div>
                    </TableCell>

                    {/* Slot Badge */}
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="border-volt/40 bg-volt/10 text-volt text-[10px] font-bold uppercase tracking-wider">
                        ⚙ {slot || 'auto'}
                      </Badge>
                    </TableCell>

                    {/* Builder Specs (Socket, Watts) */}
                    <TableCell className="py-2.5 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {socketVal && (
                          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground/80">
                            Socket: {socketVal}
                          </span>
                        )}
                        {wattsVal && (
                          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground/80">
                            TDP: {wattsVal} W
                          </span>
                        )}
                        {!socketVal && !wattsVal && (
                          <span className="text-[11px] text-muted-foreground italic">Standard</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Price & Stock */}
                    <TableCell className="py-2.5 text-xs font-semibold">
                      <div className="text-volt font-bold">{formatPrice(Number(p.price))}</div>
                      <div className="text-[10px] text-muted-foreground">Stock: {p.stock} unités</div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEditModal(p)}
                          title="Modifier les paramètres builder"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveFromBuilder(p)}
                          title="Retirer du Configurateur"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 5. ADD / EDIT COMPONENT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={(o) => !o && setIsModalOpen(false)}>
        <DialogContent className="w-full sm:w-[50vw] sm:max-w-[50vw] md:w-[50vw] md:max-w-[50vw] max-w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden min-w-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-volt" />
              {editingProduct ? 'Modifier le composant configuré' : 'Ajouter un composant au Configurateur'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configurez le slot et les caractéristiques techniques nécessaires à la compatibilité du PC Builder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* If Adding, choose between Select existing product or Add new product */}
            {!editingProduct ? (
              <div className="space-y-3">
                {/* Segmented Control on left */}
                <div className="flex justify-start">
                  <div className="inline-flex rounded-lg border border-border p-1 bg-secondary/40 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAddMode('select')}
                      className={`py-1.5 px-4 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        addMode === 'select'
                          ? 'bg-card text-foreground shadow-sm font-bold border border-border'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Package className="h-3.5 w-3.5 text-volt" />
                      Sélectionner un produit (Select)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMode('new')}
                      className={`py-1.5 px-4 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        addMode === 'new'
                          ? 'bg-card text-foreground shadow-sm font-bold border border-border'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5 text-volt" />
                      + Ajouter un nouveau produit
                    </button>
                  </div>
                </div>

                {addMode === 'select' ? (
                  /* SELECT EXISTING PRODUCT */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Choisir un composant du catalogue</Label>
                      <button
                        type="button"
                        onClick={() => setAddMode('new')}
                        className="text-[11px] font-bold text-volt hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Nouveau produit
                      </button>
                    </div>

                    {/* Filter Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Filtrer la liste des produits..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-8 h-9 text-xs bg-secondary"
                      />
                    </div>

                    {/* Select Input */}
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="h-10 text-xs bg-secondary w-full min-w-0 max-w-full">
                        <SelectValue placeholder="-- Sélectionnez un produit --" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {candidateProducts.length === 0 ? (
                          <div className="p-3 text-xs text-center text-muted-foreground">
                            Aucun produit correspondant.{' '}
                            <button
                              type="button"
                              onClick={() => setAddMode('new')}
                              className="text-volt font-bold hover:underline"
                            >
                              Créer un produit
                            </button>
                          </div>
                        ) : (
                          candidateProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id} textValue={p.name} className="text-xs py-2">
                              <div className="flex items-center justify-between w-full min-w-0 gap-3">
                                <span className="truncate font-medium flex-1 text-left min-w-0">{p.name}</span>
                                <span className="font-bold text-volt shrink-0 ml-2">{formatPrice(Number(p.price))}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                    {/* Selected Product Preview Card */}
                    {selectedProduct && (
                      <div className="rounded-lg border border-volt/30 bg-volt/5 p-2.5 flex items-center justify-between animate-in fade-in-50">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="h-9 w-9 rounded border border-border bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                            {selectedProduct.images[0] ? (
                              <img src={selectedProduct.images[0]} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-xs text-foreground truncate">{selectedProduct.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              Stock: {selectedProduct.stock} | Catégorie: {selectedProduct.category_id ? categoryMap.get(selectedProduct.category_id) || 'Composant' : 'Composant'}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-xs text-volt shrink-0 ml-2">
                          {formatPrice(Number(selectedProduct.price))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ADD NEW PRODUCT FORM */
                  <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-volt">
                        <Plus className="h-3.5 w-3.5" /> Créer un nouveau composant
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddMode('select')}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline"
                      >
                        ← Choisir un existant
                      </button>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Nom du composant / produit *</Label>
                      <Input
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="Ex: AMD Ryzen 7 7800X3D"
                        className="h-8 text-xs bg-secondary"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Prix (MAD) *</Label>
                        <Input
                          type="number"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          placeholder="Ex: 4800"
                          className="h-8 text-xs bg-secondary"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Stock (Unités)</Label>
                        <Input
                          type="number"
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(e.target.value)}
                          placeholder="10"
                          className="h-8 text-xs bg-secondary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Catégorie</Label>
                        <Select value={newProdCategoryId} onValueChange={setNewProdCategoryId}>
                          <SelectTrigger className="h-8 text-xs bg-secondary">
                            <SelectValue placeholder="Choisir catégorie..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Marque (Optionnel)</Label>
                        <Select value={newProdBrandId} onValueChange={setNewProdBrandId}>
                          <SelectTrigger className="h-8 text-xs bg-secondary">
                            <SelectValue placeholder="Choisir marque..." />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((b) => (
                              <SelectItem key={b.id} value={b.id} className="text-xs">
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Photo du produit</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          placeholder="URL de l'image ou téléversez ci-contre"
                          className="h-8 text-xs bg-secondary flex-1"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-xs font-semibold border border-border shrink-0">
                          <Upload className="h-3.5 w-3.5 text-volt" />
                          <span>{uploadingImage ? '...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setUploadingImage(true)
                              try {
                                const dataUrl = await fileToResizedDataUrl(file)
                                setNewProdImage(dataUrl)
                              } catch {
                                toast.error('Erreur lors du traitement de l’image')
                              } finally {
                                setUploadingImage(false)
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-secondary/30 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded border border-border bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                  {editingProduct.images[0] && <img src={editingProduct.images[0]} alt="" className="h-full w-full object-contain" />}
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground line-clamp-1">{editingProduct.name}</div>
                  <div className="text-xs font-bold text-volt">{formatPrice(Number(editingProduct.price))}</div>
                </div>
              </div>
            )}

            {/* Select Slot */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Emplacement / Slot dans le Configurateur PC</Label>
              <Select value={builderSlot} onValueChange={(v) => setBuilderSlot(v as SlotId)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOTS.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Socket & Watts in 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Socket (si CPU ou Carte Mère)</Label>
                <Input
                  placeholder="Ex: AM5, LGA1700, AM4..."
                  value={socket}
                  onChange={(e) => setSocket(e.target.value)}
                  className="h-9 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Vérifie la compatibilité CPU & Carte Mère</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Consommation / TDP (Watts)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 65, 750, 850..."
                  value={watts}
                  onChange={(e) => setWatts(e.target.value)}
                  className="h-9 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Utilisé pour calculer l'alimentation</p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 sm:justify-start justify-start flex-row gap-3">
            <Button
              onClick={handleSaveComponent}
              disabled={
                saving ||
                (!editingProduct && addMode === 'select' && !selectedProductId) ||
                (!editingProduct && addMode === 'new' && (!newProdName.trim() || !newProdPrice))
              }
              className="bg-volt text-volt-fg hover:bg-volt-dim font-bold text-xs"
            >
              {saving
                ? 'Enregistrement...'
                : editingProduct
                ? 'Enregistrer les modifications'
                : addMode === 'new'
                ? 'Créer et ajouter au Configurateur'
                : 'Ajouter au Configurateur'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
