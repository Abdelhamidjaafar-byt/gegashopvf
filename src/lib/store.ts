/** Fallback WhatsApp number (digits only, international format without '+') when no admin phone is set. */
export const FALLBACK_WHATSAPP = '212708065528'

/** Strip non-digits from phone number for WhatsApp wa.me links. */
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits || FALLBACK_WHATSAPP
}

export function whatsappLink(to: string, message: string) {
  const cleanTo = formatWhatsAppNumber(to)
  return `https://wa.me/${cleanTo}?text=${encodeURIComponent(message)}`
}

