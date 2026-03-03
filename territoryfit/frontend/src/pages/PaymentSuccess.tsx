import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag } from 'lucide-react';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          navigate({ to: '/inventory' });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 animate-scale-in">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-xs">
        Your purchase was completed successfully. Your items are now available in your inventory.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate({ to: '/inventory' })} className="gap-2">
          <ShoppingBag className="w-4 h-4" />
          View Inventory
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/store' })}>
          Back to Store
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-6">
        Redirecting to inventory in {countdown}s...
      </p>
    </div>
  );
}
