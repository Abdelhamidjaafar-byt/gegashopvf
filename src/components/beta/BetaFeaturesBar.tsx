import { Truck, Headset, ShieldCheck, MapPin, RefreshCw, Award } from 'lucide-react'

const FEATURES = [
  {
    icon: Truck,
    title: 'Fast Nationwide Delivery',
    subtitle: 'Free shipping across Morocco on orders above 500 MAD (Cathedis)',
  },
  {
    icon: Headset,
    title: 'Support 24/7 & Advice',
    subtitle: 'Expert build help & phone support (+212 673 881 080)',
  },
  {
    icon: RefreshCw,
    title: 'Real-time Order Tracking',
    subtitle: 'Track your parcel status directly step-by-step from your account',
  },
  {
    icon: Award,
    title: '100% Authentic & Warranted',
    subtitle: 'Genuine components with official distributor warranty',
  },
]

export default function BetaFeaturesBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((item, idx) => {
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
