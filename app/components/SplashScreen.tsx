'use client';

import { useEffect, useState } from 'react';

type Phase = 'hidden' | 'visible' | 'hiding';

export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    const seen = sessionStorage.getItem('splash-seen');

    if (isStandalone && !seen) {
      sessionStorage.setItem('splash-seen', '1');
      setPhase('visible');

      const t1 = setTimeout(() => setPhase('hiding'), 2000);
      const t2 = setTimeout(() => setPhase('hidden'), 2450);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div
      className={`splash-overlay ${phase === 'hiding' ? 'splash-exit' : 'splash-enter'}`}
      aria-hidden="true"
    >
      <div className="splash-glow" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/android/launchericon-192x192.png"
        alt=""
        className="splash-icon"
        width={96}
        height={96}
      />
      <p className="splash-title">TRUE LINE</p>
      <div className="splash-bar">
        <div className="splash-bar-fill" />
      </div>
    </div>
  );
}
