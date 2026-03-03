import React, { createContext, useContext, useState, useEffect } from 'react';

interface FeatureFlags {
  aiCoachEnabled: boolean;
  teamBattlesEnabled: boolean;
  iapStoreEnabled: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  setFlag: (key: keyof FeatureFlags, value: boolean) => void;
}

const DEFAULT_FLAGS: FeatureFlags = {
  aiCoachEnabled: true,
  teamBattlesEnabled: true,
  iapStoreEnabled: true,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    try {
      const stored = localStorage.getItem('featureFlags');
      return stored ? { ...DEFAULT_FLAGS, ...JSON.parse(stored) } : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('featureFlags', JSON.stringify(flags));
  }, [flags]);

  const setFlag = (key: keyof FeatureFlags, value: boolean) => {
    setFlags(prev => ({ ...prev, [key]: value }));
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlag }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  return ctx;
}
