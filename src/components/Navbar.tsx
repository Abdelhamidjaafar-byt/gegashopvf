import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Heart,
  LogOut,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  User,
  Flame,
  HelpCircle,
  Truck,
  Headset,
  Sliders
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { setLanguage } from '@/i18n'
import { STORE_PHONE_DISPLAY, FALLBACK_WHATSAPP } from '@/lib/store'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CategoriesMenuDesktop, CategoriesMenuMobile } from '@/components/CategoriesMenu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, hasAdminAccess, signOut } = useAuth()
  const { count, items } = useCart()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const cartSubtotal = items.reduce((acc, item) => acc + Number(item.product.price) * item.qty, 0)

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">

      {/* 1. TOP ANNOUNCEMENT / SECONDARY BAR */}
      <div className="hidden border-b border-border/60 bg-secondary/50 text-[11px] text-muted-foreground sm:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Top Left Menu */}
          <div className="flex items-center gap-4">
            <Link to="/shop" className="hover:text-volt transition-colors font-medium">About Us</Link>
            <span>•</span>
            <Link to="/shop" className="hover:text-volt transition-colors font-medium">Our Partners</Link>
            <span>•</span>
            <Link to="/deals" className="flex items-center gap-1 font-bold text-volt hover:text-volt-dim transition-colors">
              <Flame className="h-3 w-3 fill-volt" /> Flash Sales
            </Link>
          </div>

          {/* Top Right Menu */}
          <div className="flex items-center gap-4">
            <Link to="/profile?tab=orders" className="flex items-center gap-1 hover:text-volt transition-colors font-medium">
              <Truck className="h-3 w-3 text-volt" /> Track Your Order
            </Link>
            <span>•</span>
            <a
              href={`https://wa.me/${FALLBACK_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-volt transition-colors font-medium"
            >
              <Phone className="h-3 w-3 text-volt" /> Contact Us
            </a>
            <span>•</span>
            <Link to="/shop" className="flex items-center gap-1 hover:text-volt transition-colors font-medium">
              <HelpCircle className="h-3 w-3 text-volt" /> FAQs
            </Link>
          </div>

        </div>
      </div>

      {/* 2. MAIN HEADER ROW (LOGO, SEARCH, PHONE SUPPORT, CART) */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* BRAND LOGO */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ElectroGega" className="h-9 w-auto max-w-[140px] object-contain" />
          <div className="flex flex-col">
            <span className="font-display text-lg font-black tracking-tight leading-none text-foreground">
              ELECTRO<span className="text-volt">GEGA</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Gaming Setups & Tech
            </span>
          </div>
        </Link>

        {/* SEARCH BAR CENTER */}
        <form onSubmit={submitSearch} className="hidden flex-1 max-w-xl mx-4 lg:flex items-center">
          <div className="relative w-full flex items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, GPUs, laptops, CPUs..."
              className="h-10 pl-4 pr-24 bg-secondary border-border focus-visible:ring-volt rounded-l-lg rounded-r-none text-xs"
            />
            <Button
              type="submit"
              className="h-10 rounded-l-none rounded-r-lg bg-volt text-volt-fg hover:bg-volt-dim px-5 text-xs font-bold uppercase tracking-wider shrink-0"
            >
              <Search className="h-4 w-4 mr-1" /> Search
            </Button>
          </div>
        </form>

        {/* RIGHT SIDE ACTIONS: SUPPORT 24/7 & CART */}
        <div className="flex items-center gap-3">

          {/* PHONE SUPPORT BOX */}
          <div className="hidden xl:flex items-center gap-2 border-r border-border/80 pr-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-volt/10 text-volt border border-volt/30">
              <Headset className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Support 24/7</span>
              <a href={`tel:${STORE_PHONE_DISPLAY}`} className="text-xs font-extrabold text-foreground hover:text-volt transition-colors mt-0.5">
                {STORE_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          {/* LANGUAGE SWITCHER */}
          <button
            onClick={() => setLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
            className="text-xs font-bold tracking-widest px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-volt transition-colors"
          >
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </button>

          {/* WISHLIST LINK */}
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 relative hidden sm:flex">
            <Link to="/profile?tab=wishlist" aria-label={t('nav.wishlist')}>
              <Heart className="h-4 w-4" />
            </Link>
          </Button>

          {/* SHOPPING CART WIDGET */}
          <Button asChild variant="outline" className="h-10 border-border bg-card hover:border-volt/60 transition-all px-3">
            <Link to="/cart" className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart className="h-4 w-4 text-volt" />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-volt px-1 text-[9px] font-bold text-volt-fg">
                    {count}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-muted-foreground leading-none">{count} {count === 1 ? 'item' : 'items'}</span>
                <span className="text-xs font-extrabold text-volt mt-0.5">{formatPrice(cartSubtotal, i18n.language)}</span>
              </div>
            </Link>
          </Button>

          {/* USER ACCOUNT DROPDOWN */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('nav.account')}>
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user.display_name || user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" /> {t('nav.account')}
                </DropdownMenuItem>
                {hasAdminAccess && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <ShieldCheck className="mr-2 h-4 w-4 text-volt" /> {t('nav.admin')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> {t('nav.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden sm:flex bg-volt text-volt-fg hover:bg-volt-dim font-bold text-xs h-9">
              <Link to="/auth">{t('nav.signIn')}</Link>
            </Button>
          )}

          {/* MOBILE MENU TRIGGER */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <form onSubmit={submitSearch} className="mt-6">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products..."
                  className="bg-secondary text-xs"
                />
              </form>
              <nav className="mt-6 flex flex-col gap-4">
                <Link to="/shop" onClick={() => setOpen(false)} className="text-base font-bold">
                  ElectroGega Shop
                </Link>
                <Link to="/deals" onClick={() => setOpen(false)} className="flex items-center gap-2 text-base font-bold text-volt">
                  <Flame className="h-4 w-4 text-volt fill-volt" />
                  Flash Sales & Deals
                </Link>
                <Link to="/builder" onClick={() => setOpen(false)} className="text-base font-bold text-foreground">
                  Custom PC Builder
                </Link>
                <div className="border-t border-border pt-4">
                  <CategoriesMenuMobile onNavigate={() => setOpen(false)} />
                </div>
                <Link to="/cart" onClick={() => setOpen(false)} className="text-base font-bold">
                  {t('nav.cart')} ({count})
                </Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-base font-bold">
                  {t('nav.account')}
                </Link>
                {hasAdminAccess && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-base font-bold text-volt">
                    {t('nav.admin')}
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

        </div>

      </div>

      {/* 3. CATEGORIES NAVIGATION RIBBON */}
      <div className="hidden border-t border-border/80 bg-secondary/40 lg:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 text-xs">

          <div className="flex items-center gap-6">
            <CategoriesMenuDesktop />
            <Link to="/shop" className="font-semibold text-foreground hover:text-volt transition-colors">
              ElectroGega Shop
            </Link>
            <Link to="/shop?category=pc-gamer" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              PC Gamer
            </Link>
            <Link to="/shop?category=laptops" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Laptops
            </Link>
            <Link to="/shop?category=displays-tv" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Monitors
            </Link>
            <Link to="/shop?q=Apple" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Apple
            </Link>
            <Link to="/shop?q=Chair" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Gaming Chairs
            </Link>
            <Link to="/shop?category=peripheriques" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Peripherals
            </Link>
            <Link to="/builder" className="flex items-center gap-1 font-bold text-volt hover:text-volt-dim transition-colors">
              <Sliders className="h-3.5 w-3.5" /> PC Builder
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/deals" className="flex items-center gap-1 font-extrabold text-volt hover:underline">
              <Flame className="h-3.5 w-3.5 fill-volt" /> Live Deals
            </Link>
          </div>

        </div>
      </div>

    </header>
  )
}
