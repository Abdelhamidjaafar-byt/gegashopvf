import { Link } from 'react-router'
import { Zap, Truck, ShieldCheck, Headset, MapPin, Instagram, Phone, MessageCircle, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { STORE_ADDRESS, STORE_INSTAGRAM_URL, STORE_MAPS_URL, STORE_PHONE_DISPLAY, FALLBACK_WHATSAPP } from '@/lib/store'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        {/* Column 1: Brand */}
        <div>
          <Link to="/" className="flex items-center gap-1.5 font-display text-lg font-bold">
            <Zap className="h-5 w-5 text-volt" strokeWidth={2.5} />
            ELECTRO<span className="text-volt">GEGA</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium electronics, PC building, and gaming gear delivered anywhere in Morocco.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <a
              href={STORE_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold hover:border-volt hover:text-volt transition-colors"
            >
              <Instagram className="h-4 w-4 text-volt" /> @electrogega
            </a>
            <a
              href={`https://wa.me/${FALLBACK_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold hover:border-volt hover:text-volt transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-volt" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Column 2: Contact & Store Location */}
        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Visit & Contact Us</h4>
          
          <a
            href={STORE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-volt transition-colors group"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-volt group-hover:scale-110 transition-transform" />
            <span>
              {STORE_ADDRESS}
              <span className="ml-1 inline-flex items-center text-[10px] text-volt underline">
                (Google Maps <ExternalLink className="ml-0.5 h-2.5 w-2.5" />)
              </span>
            </span>
          </a>

          <a
            href={`https://wa.me/${FALLBACK_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-volt transition-colors"
          >
            <Phone className="h-4 w-4 shrink-0 text-volt" />
            <span>{STORE_PHONE_DISPLAY}</span>
          </a>

          <a
            href={STORE_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-volt transition-colors"
          >
            <Instagram className="h-4 w-4 shrink-0 text-volt" />
            <span>instagram.com/electrogega</span>
          </a>
        </div>

        {/* Column 3 & 4: Customer Services & Guarantees */}
        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Services</h4>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
            <p>{t('home.freeShipping')}</p>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
            <p>{t('home.warranty')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Support</h4>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Headset className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
            <p>{t('home.support')}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border/80 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ElectroGega — Kisariyat Kolali N27, Oujda. Delivery partner: Cathedis Morocco
      </div>
    </footer>
  )
}
