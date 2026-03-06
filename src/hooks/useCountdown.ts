import { useState, useEffect } from 'react';
import { EVENT } from '@/lib/constants';
import { pad } from '@/lib/helpers';

interface Countdown {
  days: string;
  hours: string;
  mins: string;
  secs: string;
  expired: boolean;
}

export function useCountdown(): Countdown {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = EVENT.targetDate.getTime() - now;

  if (diff <= 0) {
    return { days: '00', hours: '00', mins: '00', secs: '00', expired: true };
  }

  return {
    days: pad(Math.floor(diff / 864e5)),
    hours: pad(Math.floor((diff % 864e5) / 36e5)),
    mins: pad(Math.floor((diff % 36e5) / 6e4)),
    secs: pad(Math.floor((diff % 6e4) / 1e3)),
    expired: false,
  };
}
