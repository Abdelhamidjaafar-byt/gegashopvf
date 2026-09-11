import type { Product } from '@/types'

// PC Builder — component catalog for the custom build configurator.
// Parts are store-side data (not DB products); when added to the cart they are
// converted to Product objects so checkout works identically to regular items.

export type SlotId = 'cpu' | 'cooler' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case'

export interface BuildPart {
  id: string
  slot: SlotId
  name: string
  brand: string
  price: number
  watts: number
  socket?: 'AM5' | 'LGA1700' // cpu / motherboard compatibility
  psuWatts?: number         // psu capacity
  spec: string
}

export interface SlotDef {
  id: SlotId
  required: boolean
}

export const SLOTS: SlotDef[] = [
  { id: 'cpu', required: true },
  { id: 'cooler', required: false },
  { id: 'motherboard', required: true },
  { id: 'ram', required: true },
  { id: 'gpu', required: false },
  { id: 'storage', required: true },
  { id: 'psu', required: true },
  { id: 'case', required: true },
]

export const PARTS: BuildPart[] = [
  // CPUs
  { id: 'cpu-7800x3d', slot: 'cpu', name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', price: 4499, watts: 120, socket: 'AM5', spec: '8 cores · 5.0 GHz · 3D V-Cache' },
  { id: 'cpu-9800x3d', slot: 'cpu', name: 'AMD Ryzen 7 9800X3D', brand: 'AMD', price: 5899, watts: 120, socket: 'AM5', spec: '8 cores · 5.2 GHz · Best for gaming' },
  { id: 'cpu-14600k', slot: 'cpu', name: 'Intel Core i5-14600K', brand: 'Intel', price: 3199, watts: 125, socket: 'LGA1700', spec: '14 cores · 5.3 GHz' },
  { id: 'cpu-14900k', slot: 'cpu', name: 'Intel Core i9-14900K', brand: 'Intel', price: 6499, watts: 253, socket: 'LGA1700', spec: '24 cores · 6.0 GHz' },
  // Coolers
  { id: 'cool-hyper212', slot: 'cooler', name: 'Hyper 212 Black', brand: 'Cooler Master', price: 449, watts: 3, spec: 'Air tower · 4 heat pipes' },
  { id: 'cool-nhd15', slot: 'cooler', name: 'NH-D15 G2', brand: 'Noctua', price: 1299, watts: 5, spec: 'Dual-tower air · Silent' },
  { id: 'cool-kraken', slot: 'cooler', name: 'Kraken 240 RGB', brand: 'NZXT', price: 1799, watts: 10, spec: '240 mm AIO liquid · LCD pump' },
  // Motherboards
  { id: 'mb-b650', slot: 'motherboard', name: 'B650 Tomahawk WiFi', brand: 'MSI', price: 2399, watts: 55, socket: 'AM5', spec: 'AM5 · DDR5 · WiFi 6E' },
  { id: 'mb-x670e', slot: 'motherboard', name: 'ROG Strix X670E-E', brand: 'ASUS', price: 4999, watts: 70, socket: 'AM5', spec: 'AM5 · PCIe 5.0 · USB4' },
  { id: 'mb-b760', slot: 'motherboard', name: 'B760M Mortar WiFi', brand: 'MSI', price: 1899, watts: 50, socket: 'LGA1700', spec: 'LGA1700 · DDR5 · mATX' },
  { id: 'mb-z790', slot: 'motherboard', name: 'Z790 Aorus Elite AX', brand: 'Gigabyte', price: 3299, watts: 65, socket: 'LGA1700', spec: 'LGA1700 · DDR5 · WiFi 6E' },
  // RAM
  { id: 'ram-32-5600', slot: 'ram', name: '32 GB DDR5-5600', brand: 'Kingston Fury', price: 1199, watts: 10, spec: '2× 16 GB · CL36' },
  { id: 'ram-32-6000', slot: 'ram', name: '32 GB DDR5-6000 RGB', brand: 'Corsair', price: 1599, watts: 12, spec: '2× 16 GB · CL30 · EXPO/XMP' },
  { id: 'ram-64-6000', slot: 'ram', name: '64 GB DDR5-6000', brand: 'G.Skill', price: 2899, watts: 16, spec: '2× 32 GB · CL30' },
  // GPUs
  { id: 'gpu-4070s', slot: 'gpu', name: 'GeForce RTX 4070 Super', brand: 'NVIDIA', price: 7999, watts: 220, spec: '12 GB GDDR6X · 1440p ultra' },
  { id: 'gpu-4080s', slot: 'gpu', name: 'GeForce RTX 4080 Super', brand: 'NVIDIA', price: 12999, watts: 320, spec: '16 GB GDDR6X · 4K high' },
  { id: 'gpu-7900xtx', slot: 'gpu', name: 'Radeon RX 7900 XTX', brand: 'AMD', price: 11499, watts: 355, spec: '24 GB GDDR6 · 4K high' },
  { id: 'gpu-4090', slot: 'gpu', name: 'GeForce RTX 4090', brand: 'NVIDIA', price: 21999, watts: 450, spec: '24 GB GDDR6X · 4K max' },
  // Storage
  { id: 'ssd-1tb', slot: 'storage', name: '1 TB NVMe Gen4', brand: 'Kingston', price: 899, watts: 7, spec: '7 000 MB/s read' },
  { id: 'ssd-2tb', slot: 'storage', name: '2 TB NVMe Gen4', brand: 'Western Digital', price: 1599, watts: 8, spec: 'SN850X · 7 300 MB/s' },
  { id: 'ssd-4tb', slot: 'storage', name: '4 TB NVMe Gen4', brand: 'Samsung', price: 3499, watts: 9, spec: '990 Pro · 7 450 MB/s' },
  // PSUs
  { id: 'psu-750', slot: 'psu', name: '750 W 80+ Gold', brand: 'Corsair', price: 999, watts: 0, psuWatts: 750, spec: 'Fully modular · RM750e' },
  { id: 'psu-850', slot: 'psu', name: '850 W 80+ Gold', brand: 'Seasonic', price: 1399, watts: 0, psuWatts: 850, spec: 'Fully modular · Focus GX' },
  { id: 'psu-1000', slot: 'psu', name: '1000 W 80+ Platinum', brand: 'be quiet!', price: 2199, watts: 0, psuWatts: 1000, spec: 'Dark Power 13 · ATX 3.0' },
  { id: 'psu-1200', slot: 'psu', name: '1200 W 80+ Platinum', brand: 'Corsair', price: 2899, watts: 0, psuWatts: 1200, spec: 'HX1200i · ATX 3.1' },
  // Cases
  { id: 'case-4000d', slot: 'case', name: '4000D Airflow', brand: 'Corsair', price: 1099, watts: 0, spec: 'Mid-tower · 2× 120 mm fans' },
  { id: 'case-h6', slot: 'case', name: 'H6 Flow RGB', brand: 'NZXT', price: 1499, watts: 0, spec: 'Dual-chamber · 3× RGB fans' },
  { id: 'case-o11', slot: 'case', name: 'O11 Dynamic Evo', brand: 'Lian Li', price: 2199, watts: 0, spec: 'Panoramic glass · Showcase' },
]

export type BuildSelection = Partial<Record<SlotId, BuildPart>>

export function partsForSlot(slot: SlotId): BuildPart[] {
  return PARTS.filter((p) => p.slot === slot)
}

export function buildWatts(sel: BuildSelection): number {
  return Object.values(sel).reduce((sum, p) => sum + (p?.watts ?? 0), 0)
}

export function buildTotal(sel: BuildSelection): number {
  return Object.values(sel).reduce((sum, p) => sum + (p?.price ?? 0), 0)
}

export function recommendedPsu(sel: BuildSelection): number {
  // 40% headroom, rounded up to the nearest 50 W
  return Math.ceil((buildWatts(sel) * 1.4) / 50) * 50
}

export function socketMismatch(sel: BuildSelection): boolean {
  const cpu = sel.cpu
  const mb = sel.motherboard
  return !!(cpu?.socket && mb?.socket && cpu.socket !== mb.socket)
}

export function psuUndersized(sel: BuildSelection): boolean {
  const psu = sel.psu
  if (!psu?.psuWatts) return false
  return psu.psuWatts < recommendedPsu(sel)
}

export function missingRequired(sel: BuildSelection): SlotId[] {
  return SLOTS.filter((s) => s.required && !sel[s.id]).map((s) => s.id)
}

const SLOT_CATEGORY: Record<SlotId, { category_id: string; category_name: string }> = {
  cpu: { category_id: 'c1000000-0000-4000-8000-000000000028', category_name: 'Processeurs' },
  cooler: { category_id: 'c1000000-0000-4000-8000-000000000008', category_name: 'Composants' },
  motherboard: { category_id: 'c1000000-0000-4000-8000-000000000029', category_name: 'Cartes Mères' },
  ram: { category_id: 'c1000000-0000-4000-8000-000000000030', category_name: 'Stockage & RAM' },
  gpu: { category_id: 'c1000000-0000-4000-8000-000000000027', category_name: 'Cartes Graphiques' },
  storage: { category_id: 'c1000000-0000-4000-8000-000000000030', category_name: 'Stockage & RAM' },
  psu: { category_id: 'c1000000-0000-4000-8000-000000000008', category_name: 'Composants' },
  case: { category_id: 'c1000000-0000-4000-8000-000000000008', category_name: 'Composants' },
}

// Convert a selected part to a Product so it can flow through cart → checkout.
export function partToProduct(part: BuildPart): Product {
  return {
    id: `build-${part.id}`,
    name: `${part.name} (PC Build)`,
    description: `${part.brand} — ${part.spec}`,
    price: part.price,
    stock: 99,
    category_id: SLOT_CATEGORY[part.slot].category_id,
    brand_id: null,
    images: [],
    specs: { Slot: part.slot.toUpperCase(), Brand: part.brand, Spec: part.spec },
    is_featured: false,
    created_at: new Date().toISOString(),
  }
}
