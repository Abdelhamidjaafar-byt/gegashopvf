import { Link } from 'react-router'
import {
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  Send,
  Truck,
  ExternalLink,
  Video,
  Twitter,
  MessageSquare,
  Linkedin,
  Globe,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { STORE_ADDRESS, STORE_MAPS_URL, STORE_PHONE_DISPLAY, FALLBACK_WHATSAPP } from '@/lib/store'
import { useSocialSettings } from '@/hooks/useSocialSettings'

function getSocialIcon(platform: string) {
  switch (platform) {
    case 'instagram':
      return <Instagram className="h-4 w-4" />
    case 'whatsapp':
      return <Send className="h-4 w-4" />
    case 'facebook':
      return <Facebook className="h-4 w-4" />
    case 'youtube':
      return <Youtube className="h-4 w-4" />
    case 'tiktok':
      return <Video className="h-4 w-4" />
    case 'twitter':
      return <Twitter className="h-4 w-4" />
    case 'discord':
      return <MessageSquare className="h-4 w-4" />
    case 'linkedin':
      return <Linkedin className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

export default function BetaSEOFooter() {
  const { t, i18n } = useTranslation()
  const { tagline, socialSettings } = useSocialSettings()
  const activeSocials = socialSettings.filter((item) => item.enabled)
  const isEn = i18n.language?.startsWith('en')

  return (
    <footer className="mt-16 border-t border-border bg-card/60">

      {/* 1. SEO TEXT BLOCK */}
      <div className="border-b border-border/80 bg-background/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="font-display text-xl font-black text-foreground md:text-2xl mb-3">
              {isEn
                ? 'ElectroGega Morocco – Gaming Setups, Laptops & Authentic Tech Gear in Oujda'
                : 'ElectroGega Maroc – Setups Gaming, PC Portables & Matériel Tech Authentique à Oujda'}
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-xs leading-relaxed space-y-3">
              <p>
                {isEn ? (
                  <>
                    <strong>ElectroGega</strong> is your premier destination for high-performance custom gaming PCs, work laptops, Apple products, and authentic computer components in Morocco. Located in <strong>Kisariyat Kolali N27, Oujda</strong>, we serve gamers, creative professionals, developers, and esports enthusiasts across all Moroccan cities including Casablanca, Rabat, Marrakech, Tangier, Agadir, Fes, and Meknes.
                  </>
                ) : (
                  <>
                    <strong>ElectroGega</strong> est votre destination de référence pour les PC gamer sur mesure, PC portables professionnels, univers Apple et composants informatiques certifiés authentiques au Maroc. Situé à <strong>Kisariyat Kolali N27, Oujda</strong>, nous livrons les passionnés d'esport, gamers, créateurs et professionnels dans tout le Maroc : Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir, Meknès...
                  </>
                )}
              </p>
              <p>
                {isEn ? (
                  <>
                    Whether you are looking to assemble an <strong>Intel Core i9 or AMD Ryzen 7800X3D gaming setup</strong>, upgrade your graphics card to the latest <strong>Nvidia GeForce RTX 40 Series</strong>, or purchase a genuine <strong>Apple MacBook Pro M3</strong>, ElectroGega offers certified authentic products with official distributor warranties, competitive prices in MAD (Dh), and fast nationwide delivery via Cathedis.
                  </>
                ) : (
                  <>
                    Que vous souhaitiez monter une configuration <strong>Intel Core i9 ou AMD Ryzen 7800X3D</strong>, équiper votre setup de la dernière <strong>Nvidia GeForce RTX série 40</strong>, ou commander un <strong>Apple MacBook Pro officiel</strong>, ElectroGega vous garantit des produits authentiques avec garantie distributeur officielle, prix justes en MAD et livraison rapide partout au Maroc via Cathedis.
                  </>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg bg-secondary/50 p-3 border border-border/60">
                  <h4 className="font-bold text-foreground text-xs">
                    {isEn ? '💻 Custom PC Assembly' : '💻 Montage PC Sur Mesure'}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {isEn
                      ? 'Free assembly, cable management & stress testing on all custom PC builder orders.'
                      : 'Montage soigné, câble management propre et tests de stabilité offerts sur toutes vos configs.'}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 border border-border/60">
                  <h4 className="font-bold text-foreground text-xs">
                    {isEn ? '🚚 Fast Delivery Everywhere' : '🚚 Livraison Rapide Partout'}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {isEn
                      ? 'Safe & insured nationwide delivery powered by Cathedis Morocco in 24–48h.'
                      : 'Expédition sécurisée et assurée dans toutes les villes du Maroc avec Cathedis en 24–48h.'}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 border border-border/60">
                  <h4 className="font-bold text-foreground text-xs">
                    {isEn ? '🛡️ Warranty & Support' : '🛡️ Garantie & Support Direct'}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {isEn
                      ? 'Direct phone & WhatsApp technical support 7 days a week from our experts in Oujda.'
                      : 'Support technique direct par téléphone & WhatsApp 7j/7 avec nos spécialistes à Oujda.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOOTER COLUMNS & NAVIGATION */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

          {/* Column 1: Store & Socials */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight">
              <img src="/logo.png" alt="ElectroGega" className="h-8 w-auto max-w-[130px] object-contain" />
              <span>ELECTRO<span className="text-volt">GEGA</span></span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tagline || t('footer.tagline', 'Setups gaming, composants PC originaux et matériel high-tech livrés partout au Maroc.')}
            </p>
            {activeSocials.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {activeSocials.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground hover:border-volt hover:text-volt transition-colors"
                    aria-label={item.name}
                    title={item.name}
                  >
                    {getSocialIcon(item.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              {t('footer.shopCategories', 'Rayons de la boutique')}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/shop?category=pc-gamer" className="hover:text-volt transition-colors">{isEn ? 'PC Gamer & Builds' : 'PC Gamer & Tours'}</Link></li>
              <li><Link to="/shop?category=laptops" className="hover:text-volt transition-colors">{isEn ? 'Laptops & Workstations' : 'PC Portables & Stations'}</Link></li>
              <li><Link to="/shop?category=composants" className="hover:text-volt transition-colors">{isEn ? 'Graphics Cards & CPUs' : 'Cartes Graphiques & Processeurs'}</Link></li>
              <li><Link to="/shop?category=displays-tv" className="hover:text-volt transition-colors">{isEn ? 'Gaming Monitors' : 'Écrans & Moniteurs Gamer'}</Link></li>
              <li><Link to="/shop?q=Apple" className="hover:text-volt transition-colors">{isEn ? 'Apple Lineup' : 'Univers Apple'}</Link></li>
              <li><Link to="/builder" className="hover:text-volt transition-colors font-bold text-volt">{t('hero.pcBuilder', 'Configurateur PC')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              {t('footer.customerSupport', 'Service Client')}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/profile?tab=orders" className="hover:text-volt transition-colors">{t('footer.trackOrder', 'Suivre votre commande')}</Link></li>
              <li><Link to="/deals" className="hover:text-volt transition-colors">{t('footer.flashDeals', 'Ventes Flash & Bons Plans')}</Link></li>
              <li><Link to="/cart" className="hover:text-volt transition-colors">{t('footer.viewCart', 'Voir mon panier')}</Link></li>
              <li><Link to="/profile" className="hover:text-volt transition-colors">{t('footer.myAccount', 'Mon compte')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              {t('footer.storeContact', 'Boutique Oujda & Contact')}
            </h4>

            <a
              href={STORE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-xs text-muted-foreground hover:text-volt transition-colors group"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-volt group-hover:scale-110 transition-transform" />
              <span>
                {STORE_ADDRESS}
                <span className="ml-1 text-[10px] text-volt underline inline-flex items-center">
                  (Google Maps <ExternalLink className="ml-0.5 h-2.5 w-2.5" />)
                </span>
              </span>
            </a>

            <a
              href={`https://wa.me/${FALLBACK_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-volt transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0 text-volt" />
              <span>{STORE_PHONE_DISPLAY}</span>
            </a>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-foreground block mb-1">
                {t('footer.deliveryPartner', 'Partenaire de livraison officiel :')}
              </span>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1 text-xs font-bold text-muted-foreground">
                <Truck className="h-3.5 w-3.5 text-volt" /> Cathedis Express Morocco
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. COPYRIGHT BAR */}
      <div className="border-t border-border/80 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ELECTROGEGA OUJDA — Gaming Setups & More. {t('footer.allRightsReserved', 'Tous droits réservés.')}
      </div>
    </footer>
  )
}
