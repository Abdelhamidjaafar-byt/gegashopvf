import { Routes, Route, Navigate } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DemoBanner from '@/components/DemoBanner'
import HomePage from '@/pages/HomePage'
import ShopPage from '@/pages/ShopPage'
import BuilderPage from '@/pages/BuilderPage'
import ProductPage from '@/pages/ProductPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import AuthPage from '@/pages/AuthPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminPage from '@/pages/AdminPage'
import '@/i18n'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="flex min-h-screen flex-col bg-background">
            <DemoBanner />
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/builder" element={<BuilderPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="bottom-right" theme="dark" />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
