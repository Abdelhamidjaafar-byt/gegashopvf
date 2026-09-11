import { Link } from 'react-router'
import { Zap, Truck, ShieldCheck, Headset } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-1.5 font-display text-lg font-bold">
            <Zap className="h-5 w-5 text-volt" strokeWidth={2.5} />
            ELECTRO<span className="text-volt">GEGA</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium electronics, delivered fast across Morocco.
          </p>
        </div>
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Truck className="mt-0.5 h-5 w-5 shrink-0 text-volt" />
          <p>{t('home.freeShipping')}</p>
        </div>
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-volt" />
          <p>{t('home.warranty')}</p>
        </div>
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Headset className="mt-0.5 h-5 w-5 shrink-0 text-volt" />
          <p>{t('home.support')}</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ElectroGega — Cathedis Standard & Express delivery partner
      </div>
    </footer>
  )
}
