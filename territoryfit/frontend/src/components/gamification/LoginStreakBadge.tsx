import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

export function LoginStreakBadge() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');
    const currentStreak = parseInt(localStorage.getItem('loginStreak') || '0');

    if (lastLogin === today) {
      setStreak(currentStreak);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak = lastLogin === yesterday.toDateString() ? currentStreak + 1 : 1;
      localStorage.setItem('loginStreak', String(newStreak));
      localStorage.setItem('lastLoginDate', today);
      setStreak(newStreak);
    }
  }, []);

  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
      <Flame className="w-3.5 h-3.5 text-orange-400" />
      <span className="text-xs font-bold font-mono text-orange-400">{streak}</span>
    </div>
  );
}
