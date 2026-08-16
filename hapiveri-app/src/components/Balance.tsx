'use client';

import { useEffect, useRef, useState } from 'react';

export default function Balance({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }

    const dur = 1400;
    let start: number | null = null;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    function tick(now: number) {
      if (start === null) start = now;
      const p = Math.min((now - start) / dur, 1);
      setShown(Math.round(value * ease(p)));
      if (p < 1) requestAnimationFrame(tick);
    }

    const timer = setTimeout(() => requestAnimationFrame(tick), 450);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="balance">
      <span className="balance-num">{shown.toLocaleString()}</span>
      <span className="balance-unit">PT</span>
    </div>
  );
}
