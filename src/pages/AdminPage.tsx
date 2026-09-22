import { Navigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Settings, ShieldCheck, Radio, Zap, Video, Tag, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductsTab from '@/components/admin/ProductsTab'
import TaxonomyTab from '@/components/admin/TaxonomyTab'
import OrdersTab from '@/components/admin/OrdersTab'
import UsersTab from '@/components/admin/UsersTab'
import OffersTab from '@/components/admin/OffersTab'
import HeroTab from '@/components/admin/HeroTab'
import SettingsTab from '@/components/admin/SettingsTab'

export default function AdminPage() {
  const { t } = useTranslation()
  const { user, isAdmin, isProductManager, hasAdminAccess, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  if (!hasAdminAccess) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-volt" />
          <h1 className="font-display text-3xl font-bold">
            {isProductManager ? t('admin.productManager', 'Product Manager Hub') : t('admin.title')}
          </h1>
          {isAdmin ? (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-2.5 py-0.5 text-xs font-semibold text-volt">
              <Radio className="h-3 w-3 animate-pulse" /> {t('admin.live')}
            </span>
          ) : (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-400">
              <Tag className="h-3 w-3" /> {t('admin.productManager', 'Product Manager')}
            </span>
          )}
        </div>
      </div>

      {isProductManager && !isAdmin && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-sky-400" />
          <span>{t('admin.productManagerNotice')}</span>
        </div>
      )}

      <Tabs defaultValue="products" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="products">{t('admin.products')}</TabsTrigger>
          <TabsTrigger value="taxonomy">{t('admin.taxonomy')}</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="offers" className="flex items-center gap-1.5 font-semibold text-volt">
                <Zap className="h-3.5 w-3.5 text-volt" />
                {t('admin.offers', 'Offers & Timers')}
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center gap-1.5 font-semibold">
                <Video className="h-3.5 w-3.5 text-volt" />
                {t('admin.hero', 'Hero & Banners')}
              </TabsTrigger>
              <TabsTrigger value="orders">{t('admin.orders')}</TabsTrigger>
              <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                {t('admin.settings')}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
        <TabsContent value="taxonomy" className="mt-6"><TaxonomyTab /></TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="offers" className="mt-6"><OffersTab /></TabsContent>
            <TabsContent value="hero" className="mt-6"><HeroTab /></TabsContent>
            <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
            <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
            <TabsContent value="settings" className="mt-6"><SettingsTab /></TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}



