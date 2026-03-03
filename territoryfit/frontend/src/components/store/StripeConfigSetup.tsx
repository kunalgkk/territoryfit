import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { Loader2, CheckCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

export function StripeConfigSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB,AU,DE,FR');

  if (isLoading) return null;

  if (isConfigured) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <CheckCircle className="w-4 h-4" />
        Stripe is configured and active
      </div>
    );
  }

  const handleSave = async () => {
    if (!secretKey.startsWith('sk_')) {
      toast.error('Invalid Stripe secret key format');
      return;
    }
    try {
      await setConfig.mutateAsync({
        secretKey,
        allowedCountries: countries.split(',').map(c => c.trim()),
      });
      toast.success('Stripe configured successfully!');
    } catch {
      toast.error('Failed to configure Stripe');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-bold text-foreground">Configure Stripe Payments</span>
      </div>
      <div>
        <Label className="text-muted-foreground text-xs">Stripe Secret Key</Label>
        <Input
          type="password"
          value={secretKey}
          onChange={e => setSecretKey(e.target.value)}
          placeholder="sk_live_..."
          className="bg-input border-border text-foreground mt-1 font-mono text-sm"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-xs">Allowed Countries (comma-separated)</Label>
        <Input
          value={countries}
          onChange={e => setCountries(e.target.value)}
          placeholder="US,CA,GB"
          className="bg-input border-border text-foreground mt-1 font-mono text-sm"
        />
      </div>
      <Button onClick={handleSave} disabled={setConfig.isPending || !secretKey} className="w-full gap-2">
        {setConfig.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Configuration
      </Button>
    </div>
  );
}
