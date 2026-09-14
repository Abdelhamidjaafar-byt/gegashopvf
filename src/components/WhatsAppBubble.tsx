import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageCircle, X, Send } from 'lucide-react'
import { FALLBACK_WHATSAPP, whatsappLink } from '@/lib/store'

export default function WhatsAppBubble() {
  const [dismissed, setDismissed] = useState(false)

  const defaultMessage = 'Hello ElectroGega, I would like to ask a question about a product.'
  const chatUrl = whatsappLink(FALLBACK_WHATSAPP, defaultMessage)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Tooltip / Mini Chat Banner */}
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-card p-3.5 shadow-2xl backdrop-blur-md max-w-xs"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute -right-2 -top-2 rounded-full bg-muted border border-border p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close message"
            >
              <X className="h-3 w-3" />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366]">
              <MessageCircle className="h-5 w-5 fill-[#25D366]/20" />
            </div>

            <div className="flex-1 pr-1">
              <p className="text-xs font-bold text-foreground">Need Help? Chat with us!</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                Our support team is online on WhatsApp.
              </p>
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 rounded bg-[#25D366] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#20ba5a] transition-colors shadow-sm"
              >
                Start Chat <Send className="h-2.5 w-2.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.a
        href={chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-[#20ba5a]"
        aria-label="Contact us on WhatsApp"
        title="Chat with ElectroGega on WhatsApp"
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping" />

        <MessageCircle className="relative h-7 w-7 fill-white stroke-[#25D366]" />

        {/* Badge */}
        <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 border-2 border-background">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        </span>
      </motion.a>
    </div>
  )
}
