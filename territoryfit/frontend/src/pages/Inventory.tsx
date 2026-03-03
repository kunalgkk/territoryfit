import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Package, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  purchasedAt: number;
  activatedAt?: number;
  expiresAt?: number;
  durationMs: number;
}

export function InventoryPage() {
  const { identity } = useInternetIdentity();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const stored = localStorage.getItem('inventory');
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleActivate = (item: InventoryItem) => {
    const updated = items.map(i =>
      i.id === item.id
        ? { ...i, activatedAt: Date.now(), expiresAt: Date.now() + i.durationMs }
        : i
    );
    setItems(updated);
    localStorage.setItem('inventory', JSON.stringify(updated));
    toast.success(`${item.name} activated!`);
  };

  const formatTimeLeft = (expiresAt: number): string => {
    const ms = expiresAt - now;
    if (ms <= 0) return 'Expired';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m remaining`;
  };

  if (!identity) {
    return <div className="text-center py-16 text-muted-foreground">Login to view inventory</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Inventory</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <div className="text-sm font-semibold text-foreground mb-2">No items yet</div>
          <div className="text-xs text-muted-foreground">Purchase items from the Store to see them here</div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const isActive = item.expiresAt && item.expiresAt > now;
            const isExpired = item.expiresAt && item.expiresAt <= now;

            return (
              <div key={item.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{item.name}</div>
                  {isActive && item.expiresAt && (
                    <div className="flex items-center gap-1 text-xs text-green-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTimeLeft(item.expiresAt)}
                    </div>
                  )}
                  {isExpired && (
                    <div className="text-xs text-muted-foreground mt-0.5">Expired</div>
                  )}
                  {!item.activatedAt && (
                    <div className="text-xs text-muted-foreground mt-0.5">Not activated</div>
                  )}
                </div>
                {!item.activatedAt && (
                  <Button size="sm" onClick={() => handleActivate(item)} className="gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Activate
                  </Button>
                )}
                {isActive && (
                  <div className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Active</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
