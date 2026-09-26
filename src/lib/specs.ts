const INTERNAL_SPEC_KEYS = new Set([
  'is_new',
  'is_build',
  'is_builder',
  'is_builder_component',
  'pc builder component',
  'pc builder slot',
  'builder_slot',
  'new arrival',
  'new_arrival',
])

export function isInternalSpecKey(key: string): boolean {
  if (!key) return false
  const lower = key.trim().toLowerCase()
  return (
    INTERNAL_SPEC_KEYS.has(lower) ||
    lower.startsWith('is_new') ||
    lower.startsWith('is_build') ||
    lower.startsWith('is_builder')
  )
}

export function isShopFilterSpecKey(key: string): boolean {
  if (!key) return false
  if (isInternalSpecKey(key)) return false
  const upper = key.trim().toUpperCase()
  if (
    upper === 'POIDS' ||
    upper === 'WEIGHT' ||
    upper.startsWith('POIDS') ||
    upper.startsWith('WEIGHT')
  ) {
    return false
  }
  return true
}

export function filterPublicSpecs(
  specs?: Record<string, string> | null
): Array<[string, string]> {
  if (!specs) return []
  return Object.entries(specs)
    .filter(
      ([k, v]) =>
        !isInternalSpecKey(k) &&
        typeof v === 'string' &&
        v.trim() !== '' &&
        v.toLowerCase() !== 'none'
    )
    .map(([k, v]) => [k.trim().toUpperCase(), v.trim()])
}

export function cleanSpecsObject(
  specs?: Record<string, string> | null
): Record<string, string> {
  if (!specs) return {}
  const cleaned: Record<string, string> = {}
  for (const [k, v] of Object.entries(specs)) {
    if (!isInternalSpecKey(k) && typeof v === 'string' && v.trim() !== '') {
      cleaned[k.trim().toUpperCase()] = v.trim()
    }
  }
  return cleaned
}
