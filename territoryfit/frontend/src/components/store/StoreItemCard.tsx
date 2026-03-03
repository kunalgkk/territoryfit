import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingItem } from '../../backend';
import { useCreateCheckoutSession } from '../../hooks/useCreateCheckoutSession';
import { Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: string;
  priceInCents: number;
  icon: string;
  category: string;
}

interface StoreItemCardProps {
  item: StoreItem;
}

export function StoreItemCard({ item }: StoreItemCardProps) {
  const checkout = useCreateCheckoutSession();

  const handlePurchase = async () => {
    const shoppingItem: ShoppingItem = {
      productName: item.name,
      productDescription: item.description,
      priceInCents: BigInt(item.priceInCents),
      quantity: BigInt(1),
      currency: 'usd',
    };

    try {
      const session = await checkout.mutateAsync([shoppingItem]);
      if (!session?.url) throw new Error('Missing session URL');
      window.location.href = session.url;
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col">
      <div className="text-3xl mb-3">{item.icon}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">{item.category}</div>
      <div className="text-sm font-bold text-foreground mb-1">{item.name}</div>
      <div className="text-xs text-muted-foreground flex-1 mb-4">{item.description}</div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold font-mono text-foreground">{item.price}</span>
        <Button
          size="sm"
          onClick={handlePurchase}
          disabled={checkout.isPending}
          className="gap-1"
        >
          {checkout.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5" />
          )}
          Buy
        </Button>
      </div>
    </div>
  );
}
