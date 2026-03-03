import React from 'react';
import { useOverlay } from '../../contexts/OverlayContext';
import { Star } from 'lucide-react';

export function LevelUpOverlay() {
  const { overlayState } = useOverlay();
  const { visible, level } = overlayState.levelUp;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />
      <div className="relative animate-level-up text-center">
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-8 h-8 text-yellow-400 fill-yellow-400"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <div className="text-white/60 text-lg font-mono uppercase tracking-widest mb-2">Level Up!</div>
        <div className="text-8xl font-bold text-white font-mono">{level}</div>
        <div className="text-white/60 text-sm mt-4 uppercase tracking-widest">New level reached</div>
      </div>
    </div>
  );
}
