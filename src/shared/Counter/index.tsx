import { useCallback, useRef } from 'react';
import './index.scss';

interface CounterProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ReactNode;
  variant?: 'default' | 'kids';
  min?: number;
  max?: number;
}

export function Counter({ label, value, onChange, icon, variant = 'default', min = 0, max = 10 }: CounterProps) {
  const numRef = useRef<HTMLSpanElement>(null);

  const update = useCallback(
    (delta: number) => {
      const next = Math.max(min, Math.min(max, value + delta));
      if (next !== value) {
        onChange(next);
        numRef.current?.classList.remove('pop');
        void numRef.current?.offsetWidth;
        numRef.current?.classList.add('pop');
      }
    },
    [value, onChange, min, max]
  );

  return (
    <div className="counter-card">
      <div className={`counter-card__icon ${variant === 'kids' ? 'counter-card__icon--kids' : ''}`}>{icon}</div>
      <span className="counter-card__label">{label}</span>
      <div className="counter-card__row">
        <button type="button" className="counter-btn" onClick={() => update(-1)} aria-label={`Decrease ${label}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14" />
          </svg>
        </button>
        <div className="counter-card__display">
          <span className="counter-card__num" ref={numRef}>
            {value}
          </span>
        </div>
        <button type="button" className="counter-btn" onClick={() => update(1)} aria-label={`Increase ${label}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
