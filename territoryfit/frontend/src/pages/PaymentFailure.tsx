import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { XCircle, RotateCcw, ShoppingBag } from 'lucide-react';

export function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6 animate-scale-in">
        <XCircle className="w-10 h-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-xs">
        Your payment could not be processed. No charges were made. Please try again or contact support.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate({ to: '/store' })} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/' })}>
          <ShoppingBag className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
