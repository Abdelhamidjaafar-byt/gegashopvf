import { Link } from 'react-router'
import { MapPin, Phone, Instagram, Facebook, Youtube, Send, Truck, ExternalLink } from 'lucide-react'
import { STORE_ADDRESS, STORE_INSTAGRAM_URL, STORE_MAPS_URL, STORE_PHONE_DISPLAY, FALLBACK_WHATSAPP } from '@/lib/store'

export default function BetaSEOFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card/60">
      
      {/* 1. SEO TEXT BLOCK */}
      <div className="border-b border-border/80 bg-background/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="font-display text-xl font-black text-foreground md:text-2xl mb-3">
              ElectroGega Morocco – Gaming Setups, Laptops & Authentic Tech Gear in Oujda
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-xs leading-relaxed space-y-3">
              <p>
                <strong>ElectroGega</strong> is your premier destination for high-performance custom gaming PCs, work laptops, Apple products, and authentic computer components in Morocco. Located in <strong>Kisariyat Kolali N27, Oujda</strong>, we serve gamers, creative professionals, developers, and esports enthusiasts across all Moroccan cities including Casablanca, Rabat, Marrakech, Tangier, Agadir, Fes, and Meknes.
              </p>
              <p>
                Whether you are looking to assemble an <strong>Intel Core i9 or AMD Ryzen 7800X3D gaming setup</strong>, upgrade your graphics card to the latest <strong>Nvidia GeForce RTX 40 Series</strong>, or purchase a genuine <strong>Apple MacBook Pro M3</strong>, ElectroGega offers certified authentic products with official distributor warranties, competitive prices in MAD (Dh), and fast nationwide delivery via Cathedis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg bg-secondary/50 p-3 border border-border/60">
                  <h4 className="font-bold text-foreground text-xs">💻 Custom PC Assembly</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Free assembly, cable management & stress testing on all custom PC builder orders.
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 border border-border/60">
                  <h4 className="font-bold text-foreground text-xs">🚚 Fast Delivery Everywhere</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Safe & insured nationwide delivery powered by Cathedis Morocco in 24–48h.
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 border border-border/60">
                  <h4 className="font-bold text-foreground text-xs">🛡️ Warranty & Support</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Direct phone & WhatsApp technical support 7 days a week from our experts in Oujda.
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
              Gaming setups, authentic PC components & electronics delivered anywhere in Morocco.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <a
                href={STORE_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground hover:border-volt hover:text-volt transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${FALLBACK_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground hover:border-volt hover:text-volt transition-colors"
                aria-label="WhatsApp"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground hover:border-volt hover:text-volt transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground hover:border-volt hover:text-volt transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/shop?category=pc-gamer" className="hover:text-volt transition-colors">PC Gamer & Builds</Link></li>
              <li><Link to="/shop?category=laptops" className="hover:text-volt transition-colors">Laptops & Workstations</Link></li>
              <li><Link to="/shop?category=composants" className="hover:text-volt transition-colors">Graphics Cards & CPUs</Link></li>
              <li><Link to="/shop?category=displays-tv" className="hover:text-volt transition-colors">Gaming Monitors</Link></li>
              <li><Link to="/shop?q=Apple" className="hover:text-volt transition-colors">Apple Lineup</Link></li>
              <li><Link to="/builder" className="hover:text-volt transition-colors font-bold text-volt">Custom PC Builder</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/profile?tab=orders" className="hover:text-volt transition-colors">Track Your Order</Link></li>
              <li><Link to="/deals" className="hover:text-volt transition-colors">Flash Sales & Deals</Link></li>
              <li><Link to="/cart" className="hover:text-volt transition-colors">View Cart</Link></li>
              <li><Link to="/profile" className="hover:text-volt transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              Oujda Store & Contact
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
              <span className="text-[11px] font-bold text-foreground block mb-1">Official Delivery Partner:</span>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1 text-xs font-bold text-muted-foreground">
                <Truck className="h-3.5 w-3.5 text-volt" /> Cathedis Express Morocco
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. COPYRIGHT BAR */}
      <div className="border-t border-border/80 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ELECTROGEGA OUJDA — Gaming Setups & More. All rights reserved.
      </div>
    </footer>
  )
}
