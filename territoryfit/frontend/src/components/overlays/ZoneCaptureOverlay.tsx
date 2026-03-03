import React from 'react';
import { useOverlay } from '../../contexts/OverlayContext';
import { Flag } from 'lucide-react';

export function ZoneCaptureOverlay() {
  const { overlayState } = useOverlay();
  const { visible, zoneName, color } = overlayState.zoneCapture;

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="animate-zone-capture">
        <div
          className="flex items-center gap-3 px-6 py-4 rounded-xl border-2 shadow-2xl"
          style={{ borderColor: color, backgroundColor: `${color}22` }}
        >
          <Flag className="w-6 h-6" style={{ color }} />
          <div>
            <div className="text-white font-bold text-lg uppercase tracking-wide">Zone Captured!</div>
            <div className="text-white/70 text-sm capitalize">{zoneName.replace(/-/g, ' ')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
