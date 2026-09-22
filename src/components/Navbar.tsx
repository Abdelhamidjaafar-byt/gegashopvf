import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Heart, Instagram, LogOut, MapPin, Menu, Moon, Phone, Search, ShieldCheck, ShoppingCart, Sun, User, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useTheme } from '@/contexts/ThemeContext'
import { setLanguage } from '@/i18n'
import { STORE_ADDRESS, STORE_INSTAGRAM_URL, STORE_MAPS_URL, STORE_PHONE_DISPLAY, FALLBACK_WHATSAPP } from '@/lib/store'
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
  const { count } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop')
    setOpen(false)
  }

  const langLinks = (
    <button
      onClick={() => setLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
      className="text-xs font-semibold tracking-widest text-muted-foreground hover:text-volt transition-colors"
    >
      {i18n.language === 'fr' ? 'EN' : 'FR'}
    </button>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      {/* Top contact & location bar */}
      <div className="hidden border-b border-border/60 bg-secondary/40 text-xs text-muted-foreground sm:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <a
              href={STORE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-volt transition-colors"
            >
              <MapPin className="h-3 w-3 text-volt" />
              <span>{STORE_ADDRESS}</span>
            </a>
            <span>•</span>
            <a
              href={`https://wa.me/${FALLBACK_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-volt transition-colors"
            >
              <Phone className="h-3 w-3 text-volt" />
              <span>{STORE_PHONE_DISPLAY}</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={STORE_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold hover:text-volt transition-colors"
            >
              <Instagram className="h-3 w-3 text-volt" />
              <span>@electrogega</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight">
          <Zap className="h-5 w-5 text-volt" strokeWidth={2.5} />
          ELECTRO<span className="text-volt">GEGA</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          <CategoriesMenuDesktop />
          <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.shop')}
          </Link>
          <Link to="/deals" className="flex items-center gap-1 text-sm font-semibold text-volt hover:text-volt-dim transition-colors">
            <Zap className="h-3.5 w-3.5" />
            {t('nav.deals', 'Deals')}
          </Link>
          <Link to="/shop?featured=1" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('home.featured')}
          </Link>
          <Link to="/builder" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.builder')}
          </Link>
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden w-64 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('nav.search')}
              className="pl-9 h-9 bg-secondary border-border focus-visible:ring-volt"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          {langLinks}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="text-foreground hover:text-volt transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-volt" /> : <Moon className="h-5 w-5 text-foreground" />}
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/profile?tab=wishlist" aria-label={t('nav.wishlist')}>
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart" aria-label={t('nav.cart')}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-volt px-1 text-[10px] font-bold text-volt-fg">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('nav.account')}>
                  <User className="h-5 w-5" />
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
            <Button asChild size="sm" className="ml-1 bg-volt text-volt-fg hover:bg-volt-dim font-semibold">
              <Link to="/auth">{t('nav.signIn')}</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <form onSubmit={submitSearch} className="mt-6">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('nav.search')}
                  className="bg-secondary"
                />
              </form>
              <nav className="mt-6 flex flex-col gap-4">
                <Link to="/shop" onClick={() => setOpen(false)} className="text-lg font-medium">
                  {t('nav.shop')}
                </Link>
                <Link to="/deals" onClick={() => setOpen(false)} className="flex items-center gap-2 text-lg font-bold text-volt">
                  <Zap className="h-4 w-4 text-volt" />
                  {t('nav.deals', 'Deals & Offers')}
                </Link>
                <Link to="/shop?featured=1" onClick={() => setOpen(false)} className="text-lg font-medium">
                  {t('home.featured')}
                </Link>
                <Link to="/builder" onClick={() => setOpen(false)} className="text-lg font-medium">
                  {t('nav.builder')}
                </Link>
                <div className="border-t border-border pt-4">
                  <CategoriesMenuMobile onNavigate={() => setOpen(false)} />
                </div>
                <Link to="/cart" onClick={() => setOpen(false)} className="text-lg font-medium">
                  {t('nav.cart')}
                </Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-lg font-medium">
                  {t('nav.account')}
                </Link>
                {hasAdminAccess && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-lg font-medium text-volt">
                    {t('nav.admin')}
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
