/** Official ElectroGega store contacts & social links */
export const FALLBACK_WHATSAPP = '212708139796'
export const STORE_PHONE_DISPLAY = '+212 708-139796'
export const STORE_INSTAGRAM_URL = 'https://www.instagram.com/electrogega/'
export const STORE_ADDRESS = 'Kisariyat Kolali N27, Oujda, Morocco'
export const STORE_MAPS_URL = 'https://share.google/ZRYZMF0cE6vVgME0y'

/** Strip non-digits from phone number for WhatsApp wa.me links. */
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits || FALLBACK_WHATSAPP
}

export function whatsappLink(to: string, message: string) {
  const cleanTo = formatWhatsAppNumber(to)
  return `https://wa.me/${cleanTo}?text=${encodeURIComponent(message)}`
}
