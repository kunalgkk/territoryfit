import React from 'react';
import { Loader2 } from 'lucide-react';

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundImage: 'url(/assets/generated/splash-bg.dim_1200x800.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <img
          src="/assets/generated/app-icon.dim_256x256.png"
          alt="TerritoryFit"
          className="w-24 h-24 rounded-2xl shadow-2xl"
        />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">TerritoryFit</h1>
          <p className="text-white/60 text-sm mt-1">Conquer the world, one step at a time</p>
        </div>
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    </div>
  );
}
