/** Fallback WhatsApp number (digits only, international format without '+') when no admin phone is set. */
export const FALLBACK_WHATSAPP = '212708065528'

export function whatsappLink(to: string, message: string) {
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`
}
