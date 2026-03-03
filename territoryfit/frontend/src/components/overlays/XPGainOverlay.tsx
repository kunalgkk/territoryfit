import React from 'react';
import { useOverlay } from '../../contexts/OverlayContext';

export function XPGainOverlay() {
  const { overlayState } = useOverlay();
  const { visible, amount } = overlayState.xpGain;

  if (!visible) return null;

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="animate-xp-float text-center">
        <div className="text-4xl font-bold font-mono text-white drop-shadow-lg">
          +{amount} XP
        </div>
        <div className="text-sm text-white/70 mt-1">Experience gained!</div>
      </div>
    </div>
  );
}
