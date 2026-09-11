import { Navigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Radio, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { isDemoMode } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductsTab from '@/components/admin/ProductsTab'
import TaxonomyTab from '@/components/admin/TaxonomyTab'
import OrdersTab from '@/components/admin/OrdersTab'
import UsersTab from '@/components/admin/UsersTab'

export default function AdminPage() {
  const { t } = useTranslation()
  const { user, isAdmin, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-volt" />
        <h1 className="font-display text-3xl font-bold">{t('admin.title')}</h1>
        {!isDemoMode && (
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-2.5 py-0.5 text-xs font-semibold text-volt">
            <Radio className="h-3 w-3 animate-pulse" /> {t('admin.live')}
          </span>
        )}
      </div>

      <Tabs defaultValue="products" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="products">{t('admin.products')}</TabsTrigger>
          <TabsTrigger value="taxonomy">{t('admin.taxonomy')}</TabsTrigger>
          <TabsTrigger value="orders">{t('admin.orders')}</TabsTrigger>
          <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
        <TabsContent value="taxonomy" className="mt-6"><TaxonomyTab /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
        <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
      </Tabs>
    </div>
  )
}
