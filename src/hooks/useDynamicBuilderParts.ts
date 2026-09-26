import { useMemo } from 'react'
import { useProducts, useCategories, useBrands } from '@/hooks/useCatalog'
import {
  PARTS,
  type BuildPart,
  type SlotId
} from '@/lib/builder-data'
import type { Product } from '@/types'

export interface DynamicBuildPart extends BuildPart {
  product?: Product
  isRealProduct: boolean
  image?: string
  stock?: number
}

const VALID_SLOTS: SlotId[] = ['cpu', 'cooler', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case']

function detectSlotForProduct(p: Product, categoryMap: Map<string, string>): SlotId | null {
  const specs = p.specs || {}

  // Check explicit builder_slot or is_builder from product specs
  const explicitSlot = (specs['PC Builder Slot'] || specs.builder_slot || '').toLowerCase()
  const isBuilderStr = String(specs.is_builder ?? specs.is_builder_component ?? specs['PC Builder Component'] ?? '')

  if (isBuilderStr === 'false' || explicitSlot === 'none' || explicitSlot === 'disabled') {
    return null
  }
  if (VALID_SLOTS.includes(explicitSlot as SlotId)) {
    return explicitSlot as SlotId
  }

  const catName = (p.category_id ? categoryMap.get(p.category_id) || '' : '').toLowerCase()
  const name = p.name.toLowerCase()

  // Exclude non-component items like laptops, pre-built complete PCs, or smartphones
  if (name.includes('laptop') || name.includes('macbook') || name.includes('iphone') || name.includes('galaxy')) {
    return null
  }

  // CPU
  if (
    catName.includes('cpu') || catName.includes('processeur') || catName.includes('processor') ||
    name.includes('ryzen') || name.includes('core i3') || name.includes('core i5') ||
    name.includes('core i7') || name.includes('core i9') || name.includes('threadripper')
  ) {
    if (!name.includes('pc gamer') && !name.includes('pc complet')) return 'cpu'
  }

  // GPU
  if (
    catName.includes('gpu') || catName.includes('carte graphique') || catName.includes('graphics') ||
    name.includes('rtx ') || name.includes('gtx ') || name.includes('radeon rx') ||
    name.includes('geforce')
  ) {
    if (!name.includes('pc gamer') && !name.includes('pc complet')) return 'gpu'
  }

  // Motherboard
  if (
    catName.includes('motherboard') || catName.includes('carte mère') || catName.includes('carte mere') || catName.includes('mobo') ||
    name.includes('b650') || name.includes('z790') || name.includes('b760') || name.includes('x670') ||
    name.includes('b550') || name.includes('z690') || name.includes('a620') || name.includes('h610') ||
    name.includes('carte mère') || name.includes('motherboard')
  ) {
    return 'motherboard'
  }

  // RAM
  if (
    catName.includes('ram') || catName.includes('mémoire') || catName.includes('memoire') ||
    name.includes('ddr4') || name.includes('ddr5') || name.includes('ram ') || name.includes('fury beast') ||
    name.includes('corsair vengeance') || name.includes('g.skill')
  ) {
    return 'ram'
  }

  // Storage
  if (
    catName.includes('storage') || catName.includes('stockage') || catName.includes('ssd') || catName.includes('hdd') ||
    name.includes('nvme') || name.includes('ssd') || name.includes('hdd') || name.includes('samsung 980') ||
    name.includes('samsung 990') || name.includes('wd_black') || name.includes('kingston nv')
  ) {
    return 'storage'
  }

  // PSU
  if (
    catName.includes('psu') || catName.includes('alimentation') || catName.includes('power supply') ||
    name.includes('80+') || name.includes('gold psu') || name.includes('750w') || name.includes('850w') ||
    name.includes('1000w') || name.includes('650w') || name.includes('550w') || name.includes('power supply')
  ) {
    return 'psu'
  }

  // Case
  if (
    catName.includes('case') || catName.includes('boitier') || catName.includes('boîtier') ||
    name.includes('airflow') || name.includes('mid tower') || name.includes('tempered glass case') ||
    name.includes('h6 flow') || name.includes('o11 dynamic') || name.includes('boitier')
  ) {
    return 'case'
  }

  // Cooler
  if (
    catName.includes('cooler') || catName.includes('refroidissement') || catName.includes('cooling') || catName.includes('ventirad') ||
    name.includes('liquid cooler') || name.includes('aio ') || name.includes('watercooling') ||
    name.includes('cpu cooler') || name.includes('kraken') || name.includes('nh-d15') || name.includes('hyper 212')
  ) {
    return 'cooler'
  }

  return null
}

function detectSocket(p: Product): 'AM5' | 'LGA1700' | undefined {
  const specs = p.specs || {}
  const explicitSocket = (specs['Socket'] || specs.socket || specs['Socket / Compatibilité'] || '').toUpperCase()

  if (explicitSocket.includes('AM5')) return 'AM5'
  if (explicitSocket.includes('LGA1700') || explicitSocket.includes('LGA 1700')) return 'LGA1700'

  const nameStr = (p.name + ' ' + (p.description || '')).toUpperCase()
  if (nameStr.includes('AM5')) return 'AM5'
  if (nameStr.includes('LGA1700') || nameStr.includes('LGA 1700')) return 'LGA1700'
  return undefined
}

function detectWatts(p: Product, slot: SlotId): number {
  const specs = p.specs || {}
  const rawWatts = specs.Watts || specs.watts || specs.TDP || specs['Consommation (TDP)']
  if (rawWatts) {
    const parsed = parseInt(String(rawWatts), 10)
    if (!isNaN(parsed) && parsed > 0) return parsed
  }

  // Model-based estimation
  const name = p.name.toLowerCase()
  if (slot === 'cpu') {
    if (name.includes('14900') || name.includes('13900')) return 253
    if (name.includes('14700') || name.includes('13700')) return 180
    if (name.includes('7950') || name.includes('7900')) return 170
    if (name.includes('7800x3d') || name.includes('9800x3d')) return 120
    if (name.includes('14600') || name.includes('13600')) return 125
    return 100
  }

  if (slot === 'gpu') {
    if (name.includes('4090')) return 450
    if (name.includes('4080')) return 320
    if (name.includes('7900')) return 355
    if (name.includes('4070')) return 220
    if (name.includes('4060')) return 160
    return 200
  }

  if (slot === 'motherboard') return 55
  if (slot === 'ram') return 12
  if (slot === 'storage') return 8
  if (slot === 'cooler') return 10

  return 0
}

function detectPsuCapacity(p: Product): number | undefined {
  const specs = p.specs || {}
  const rawCapacity = specs.psuWatts || specs['PSU Capacity'] || specs['Capacité Alimentation']
  if (rawCapacity) {
    const val = parseInt(String(rawCapacity), 10)
    if (!isNaN(val)) return val
  }
  const match = p.name.match(/(\d{3,4})\s*W/i)
  if (match) {
    const val = parseInt(match[1], 10)
    if (val >= 400 && val <= 2000) return val
  }
  return undefined
}

export function useDynamicBuilderParts() {
  const { products, loading: productsLoading } = useProducts()
  const { categories } = useCategories()
  const { brands } = useBrands()

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
  const brandMap = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands])

  const dynamicParts: DynamicBuildPart[] = useMemo(() => {
    const realParts: DynamicBuildPart[] = []

    for (const p of products) {
      const slot = detectSlotForProduct(p, categoryMap)
      if (!slot) continue

      const brandName = p.brand_id ? brandMap.get(p.brand_id) || p.name.split(' ')[0] : p.name.split(' ')[0]
      const socket = detectSocket(p)
      const watts = detectWatts(p, slot)
      const psuWatts = slot === 'psu' ? detectPsuCapacity(p) : undefined

      let specStr = p.description
      if (p.specs && Object.keys(p.specs).length > 0) {
        specStr = Object.entries(p.specs)
          .filter(([k]) => k !== 'PC Builder Slot')
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' · ')
      }

      realParts.push({
        id: p.id,
        slot,
        name: p.name,
        brand: brandName,
        price: Number(p.price),
        watts,
        socket,
        psuWatts,
        spec: specStr || 'High Performance Store Component',
        product: p,
        isRealProduct: true,
        image: p.images?.[0],
        stock: p.stock,
      })
    }

    // Combine DB real parts with fallback static PARTS if slot has fewer than 2 items
    const combined: DynamicBuildPart[] = [...realParts]

    for (const staticPart of PARTS) {
      const realInSlot = realParts.filter((p) => p.slot === staticPart.slot)
      // Only include fallback static parts if real products in DB are sparse
      if (realInSlot.length < 2) {
        combined.push({
          ...staticPart,
          isRealProduct: false,
        })
      }
    }

    return combined
  }, [products, categoryMap, brandMap])

  return {
    parts: dynamicParts,
    loading: productsLoading,
    getPartsForSlot: (slot: SlotId) => dynamicParts.filter((p) => p.slot === slot),
  }
}
