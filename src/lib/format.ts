export function formatPrice(value: number, locale: string = 'en'): string {
  const loc = locale.startsWith('fr') ? 'fr-MA' : 'en-US'
  const rounded = Math.round(value * 100) / 100
  const formatted = new Intl.NumberFormat(loc, {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded)
  return locale.startsWith('fr') ? `${formatted} DH` : `MAD ${formatted}`
}

export function formatDate(iso: string, locale: string = 'en'): string {
  return new Date(iso).toLocaleDateString(locale.startsWith('fr') ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
