import React from 'react';

export function AdBanner() {
  return (
    <div className="w-full bg-muted/30 border-t border-border px-4 py-2 flex items-center justify-center">
      <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
        Advertisement — <span className="underline cursor-pointer">Upgrade to remove ads</span>
      </div>
    </div>
  );
}
