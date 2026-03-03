import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface OverlayState {
  xpGain: { visible: boolean; amount: number };
  levelUp: { visible: boolean; level: number };
  zoneCapture: { visible: boolean; zoneName: string; color: string };
}

interface OverlayContextType {
  overlayState: OverlayState;
  showXPGain: (xp: number) => void;
  showLevelUp: (level: number) => void;
  showZoneCapture: (zoneName: string, color: string) => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [overlayState, setOverlayState] = useState<OverlayState>({
    xpGain: { visible: false, amount: 0 },
    levelUp: { visible: false, level: 0 },
    zoneCapture: { visible: false, zoneName: '', color: '' },
  });

  const xpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showXPGain = useCallback((xp: number) => {
    if (xpTimer.current) clearTimeout(xpTimer.current);
    setOverlayState(s => ({ ...s, xpGain: { visible: true, amount: xp } }));
    xpTimer.current = setTimeout(() => {
      setOverlayState(s => ({ ...s, xpGain: { ...s.xpGain, visible: false } }));
    }, 2500);
  }, []);

  const showLevelUp = useCallback((level: number) => {
    if (levelTimer.current) clearTimeout(levelTimer.current);
    setOverlayState(s => ({ ...s, levelUp: { visible: true, level } }));
    levelTimer.current = setTimeout(() => {
      setOverlayState(s => ({ ...s, levelUp: { ...s.levelUp, visible: false } }));
    }, 3500);
  }, []);

  const showZoneCapture = useCallback((zoneName: string, color: string) => {
    if (zoneTimer.current) clearTimeout(zoneTimer.current);
    setOverlayState(s => ({ ...s, zoneCapture: { visible: true, zoneName, color } }));
    zoneTimer.current = setTimeout(() => {
      setOverlayState(s => ({ ...s, zoneCapture: { ...s.zoneCapture, visible: false } }));
    }, 2500);
  }, []);

  return (
    <OverlayContext.Provider value={{ overlayState, showXPGain, showLevelUp, showZoneCapture }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used within OverlayProvider');
  return ctx;
}
