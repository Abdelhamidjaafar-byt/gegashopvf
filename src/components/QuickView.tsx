import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, getProductUrl } from '@/lib/format'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StockBadge } from './ProductCard'

export default function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const { add } = useCart()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid sm:grid-cols-2">
          <div className="aspect-square bg-secondary">
            {product.images[0] && (
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex flex-col gap-3 p-6">
            <h3 className="font-display text-xl font-bold">{product.name}</h3>
            <StockBadge stock={product.stock} />
            <p className="line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
            <p className="font-display text-2xl font-bold text-volt">
              {formatPrice(Number(product.price), i18n.language)}
            </p>
            <div className="mt-auto flex items-center gap-3">
              <div className="flex items-center rounded-md border border-border">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="flex-1 bg-volt text-volt-fg hover:bg-volt-dim font-semibold"
                disabled={product.stock <= 0}
                onClick={() => {
                  add(product, qty)
                  toast.success(t('product.addedToCart'))
                  onClose()
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> {t('product.addToCart')}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate(getProductUrl(product))}>
              {t('home.viewAll')} →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
