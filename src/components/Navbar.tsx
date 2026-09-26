import { useState, useRef, useMemo, useEffect } from 'react'
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
  Sliders,
  ArrowRight,
  Tag,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useProducts, useCategories } from '@/hooks/useCatalog'
import { useBuilderSettings } from '@/hooks/useBuilderSettings'
import { setLanguage } from '@/i18n'
import { STORE_PHONE_DISPLAY, FALLBACK_WHATSAPP } from '@/lib/store'
import { formatPrice, getProductUrl } from '@/lib/format'
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
  const { products } = useProducts()
  const { categories } = useCategories()
  const { enabled: isBuilderEnabled } = useBuilderSettings()
  const navigate = useNavigate()

  const [q, setQ] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [open, setOpen] = useState(false)
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  const cartSubtotal = items.reduce((acc, item) => acc + Number(item.product.price) * item.qty, 0)

  // Filter top matching products in real-time
  const searchResults = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return []

    return products
      .filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(query)
        const descMatch = (p.description || '').toLowerCase().includes(query)
        const specsMatch = Object.values(p.specs || {}).some((v) =>
          String(v).toLowerCase().includes(query)
        )
        return nameMatch || descMatch || specsMatch
      })
      .slice(0, 5)
  }, [products, q])

  // Filter matching categories
  const matchingCategories = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query || query.length < 2) return []

    return categories
      .filter((c) => c.name.toLowerCase().includes(query) || (c.slug || '').toLowerCase().includes(query))
      .slice(0, 3)
  }, [categories, q])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
      setShowResults(false)
      setOpen(false)
    } else {
      navigate('/shop')
      setShowResults(false)
      setOpen(false)
    }
  }

  // Dismiss live search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">

      {/* 1. TOP ANNOUNCEMENT / SECONDARY BAR */}
      <div className="hidden border-b border-border/60 bg-secondary/50 text-[11px] text-muted-foreground sm:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Top Left Menu */}
          <div className="flex items-center gap-4">
            <Link to="/shop" className="hover:text-volt transition-colors font-medium">{t('navTop.aboutUs', 'À propos')}</Link>
            <span>•</span>
            <Link to="/shop" className="hover:text-volt transition-colors font-medium">{t('navTop.ourPartners', 'Nos Partenaires')}</Link>
            <span>•</span>
            <Link to="/deals" className="flex items-center gap-1 font-bold text-volt hover:text-volt-dim transition-colors">
              <Flame className="h-3 w-3 fill-volt" /> {t('navTop.flashSales', 'Ventes Flash')}
            </Link>
          </div>

          {/* Top Right Menu */}
          <div className="flex items-center gap-4">
            <Link to="/profile?tab=orders" className="flex items-center gap-1 hover:text-volt transition-colors font-medium">
              <Truck className="h-3 w-3 text-volt" /> {t('navTop.trackOrder', 'Suivre votre commande')}
            </Link>
            <span>•</span>
            <a
              href={`https://wa.me/${FALLBACK_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-volt transition-colors font-medium"
            >
              <Phone className="h-3 w-3 text-volt" /> {t('navTop.contactUs', 'Contactez-nous')}
            </a>
            <span>•</span>
            <Link to="/shop" className="flex items-center gap-1 hover:text-volt transition-colors font-medium">
              <HelpCircle className="h-3 w-3 text-volt" /> {t('navTop.faqs', 'FAQ')}
            </Link>
          </div>

        </div>
      </div>

      {/* 2. MAIN HEADER ROW (LOGO, DYNAMIC SEARCH, SUPPORT, CART) */}
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

        {/* DYNAMIC LIVE SEARCH BAR CENTER (DESKTOP) */}
        <div ref={desktopSearchRef} className="hidden flex-1 max-w-xl mx-4 lg:block relative">
          <form onSubmit={submitSearch} className="flex items-center">
            <div className="relative w-full flex items-center">
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => setShowResults(true)}
                placeholder={t('navTop.searchPlaceholder', 'Rechercher des produits, PC gamer, composants...')}
                className="h-10 pl-4 pr-24 bg-secondary border-border focus-visible:ring-volt rounded-l-lg rounded-r-none text-xs"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ('')
                    setShowResults(false)
                  }}
                  className="absolute right-24 p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <Button
                type="submit"
                className="h-10 rounded-l-none rounded-r-lg bg-volt text-volt-fg hover:bg-volt-dim px-5 text-xs font-bold uppercase tracking-wider shrink-0"
              >
                <Search className="h-4 w-4 mr-1" /> {t('navTop.search', 'Rechercher')}
              </Button>
            </div>
          </form>

          {/* DYNAMIC LIVE SEARCH DROPDOWN (20% TRANSPARENT = 80% OPAQUE) */}
          {showResults && q.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border/80 bg-card/80 p-2 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95">

              {/* Category Suggestions */}
              {matchingCategories.length > 0 && (
                <div className="mb-2 pb-2 border-b border-border/60">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-1 tracking-wider">
                    {t('navTop.categories', 'Catégories')}
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2 pt-0.5">
                    {matchingCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug || cat.id}`}
                        onClick={() => setShowResults(false)}
                        className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2.5 py-1 text-xs font-semibold hover:bg-volt hover:text-volt-fg transition-colors"
                      >
                        <Tag className="h-3 w-3 text-volt" /> {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Live Suggestions */}
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-1 tracking-wider flex justify-between items-center">
                    <span>{t('navTop.products', 'Produits')} ({searchResults.length})</span>
                    <span className="text-volt font-semibold text-[9px]">{t('navTop.liveResults', 'Résultats en direct')}</span>
                  </div>

                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={getProductUrl(product)}
                      onClick={() => setShowResults(false)}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary/80 transition-colors group"
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/50 p-1 flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-contain group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="text-xs font-bold text-muted-foreground">
                            {product.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-foreground group-hover:text-volt transition-colors truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {product.description || (i18n.language?.startsWith('en') ? 'Authentic PC product' : 'Produit high-tech authentique')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-volt block">
                          {formatPrice(Number(product.price), i18n.language)}
                        </span>
                        {product.stock > 0 ? (
                          <span className="text-[9px] font-bold text-emerald-500 uppercase">{t('shop.inStock', 'En stock')}</span>
                        ) : (
                          <span className="text-[9px] font-bold text-destructive uppercase">{t('shop.outOfStock', 'Rupture de stock')}</span>
                        )}
                      </div>
                    </Link>
                  ))}

                  {/* View All Results Footer Link */}
                  <button
                    type="button"
                    onClick={(e) => {
                      submitSearch(e)
                      setShowResults(false)
                    }}
                    className="w-full mt-2 rounded-lg bg-secondary py-2 text-center text-xs font-bold text-volt hover:bg-volt hover:text-volt-fg transition-all flex items-center justify-center gap-1"
                  >
                    {t('navTop.viewAllResults', 'Voir tous les {{count}} résultats pour', { count: searchResults.length })} "{q.trim()}" <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('navTop.noResults', 'Aucun résultat trouvé')} "{q.trim()}"</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      submitSearch(e)
                      setShowResults(false)
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-volt hover:underline"
                  >
                    {t('shop.allCategories', 'Toutes les catégories')} <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE ACTIONS: SUPPORT 24/7 & CART */}
        <div className="flex items-center gap-3">

          {/* PHONE SUPPORT BOX */}
          <div className="hidden xl:flex items-center gap-2 border-r border-border/80 pr-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-volt/10 text-volt border border-volt/30">
              <Headset className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">{t('navTop.support', 'Support 24/7')}</span>
              <a href={`tel:${STORE_PHONE_DISPLAY}`} className="text-xs font-extrabold text-foreground hover:text-volt transition-colors mt-0.5">
                {STORE_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          {/* LANGUAGE SWITCHER */}
          <button
            onClick={() => setLanguage(i18n.language?.startsWith('fr') ? 'en' : 'fr')}
            className="text-xs font-bold tracking-widest px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-volt transition-colors"
          >
            {i18n.language?.startsWith('fr') ? 'EN' : 'FR'}
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
                <span className="text-[10px] text-muted-foreground leading-none">
                  {count} {count === 1 ? t('navTop.item', 'article') : t('navTop.items', 'articles')}
                </span>
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
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <div ref={mobileSearchRef} className="mt-6 relative">
                <form onSubmit={submitSearch}>
                  <Input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value)
                      setShowResults(true)
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search products..."
                    className="bg-secondary text-xs"
                  />
                </form>

                {showResults && q.trim().length > 0 && searchResults.length > 0 && (
                  <div className="mt-2 rounded-lg border border-border/80 bg-card/80 p-2 shadow-lg backdrop-blur-md space-y-1">
                    {searchResults.slice(0, 4).map((product) => (
                      <Link
                        key={product.id}
                        to={getProductUrl(product)}
                        onClick={() => {
                          setShowResults(false)
                          setOpen(false)
                        }}
                        className="flex items-center gap-2.5 p-1.5 rounded hover:bg-secondary text-xs truncate group"
                      >
                        <span className="font-semibold truncate flex-1 group-hover:text-volt">{product.name}</span>
                        <span className="font-extrabold text-volt shrink-0">{formatPrice(Number(product.price), i18n.language)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <nav className="mt-6 flex flex-col gap-4">
                <Link to="/shop" onClick={() => setOpen(false)} className="text-base font-bold">
                  ElectroGega Shop
                </Link>
                <Link to="/deals" onClick={() => setOpen(false)} className="flex items-center gap-2 text-base font-bold text-volt">
                  <Flame className="h-4 w-4 text-volt fill-volt" />
                  Flash Sales & Deals
                </Link>
                {isBuilderEnabled && (
                  <Link to="/builder" onClick={() => setOpen(false)} className="text-base font-bold text-foreground">
                    Custom PC Builder
                  </Link>
                )}
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
              {t('nav.shop', 'Boutique')}
            </Link>
            <Link to="/shop?category=pc-gamer" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              PC Gamer
            </Link>
            <Link to="/shop?category=laptops" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {i18n.language?.startsWith('en') ? 'Laptops' : 'PC Portables'}
            </Link>
            <Link to="/shop?category=displays-tv" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {i18n.language?.startsWith('en') ? 'Monitors' : 'Écrans'}
            </Link>
            <Link to="/shop?category=univers-apple-mac" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Apple
            </Link>
            <Link to="/shop?category=chaises-et-bureaux" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {i18n.language?.startsWith('en') ? 'Gaming Chairs' : 'Chaises Gamer'}
            </Link>
            <Link to="/shop?category=peripheriques" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {i18n.language?.startsWith('en') ? 'Peripherals' : 'Périphériques'}
            </Link>
            {isBuilderEnabled && (
              <Link to="/builder" className="flex items-center gap-1 font-bold text-volt hover:text-volt-dim transition-colors">
                <Sliders className="h-3.5 w-3.5" /> {t('hero.pcBuilder', 'Configurateur PC')}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/deals" className="flex items-center gap-1 font-extrabold text-volt hover:underline">
              <Flame className="h-3.5 w-3.5 fill-volt" /> {t('navTop.liveDeals', 'Offres en direct')}
            </Link>
          </div>

        </div>
      </div>

    </header>
  )
}
