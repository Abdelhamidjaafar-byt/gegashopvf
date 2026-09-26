import { Truck, Headset, RefreshCw, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function BetaFeaturesBar() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Truck,
      title: t('features.deliveryTitle', 'Livraison Rapide Partout au Maroc'),
      subtitle: t('features.deliverySub', 'Livraison offerte dès 500 MAD partout au Maroc (Cathedis)'),
    },
    {
      icon: Headset,
      title: t('features.supportTitle', 'Support 24/7 & Conseils'),
      subtitle: t('features.supportSub', 'Aide au montage & assistance téléphonique (+212 673 881 080)'),
    },
    {
      icon: RefreshCw,
      title: t('features.trackingTitle', 'Suivi de Colis en Temps Réel'),
      subtitle: t('features.trackingSub', 'Suivez l\'état d\'acheminement de votre colis depuis votre compte'),
    },
    {
      icon: Award,
      title: t('features.warrantyTitle', '100% Authentique & Garanti'),
      subtitle: t('features.warrantySub', 'Composants originaux avec garantie distributeur officiel'),
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-volt/50 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-volt/10 text-volt border border-volt/30">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
