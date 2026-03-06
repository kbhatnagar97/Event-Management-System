import { useState, useEffect } from 'react';
import { useCheckInStore } from '@/stores/checkInStore';
import { EVENT } from '@/lib/constants';

export function PinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { authenticate } = useCheckInStore();

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === EVENT.demoPin) {
        setError(false);
        authenticate();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
      }
    }
  }, [pin, authenticate]);

  const handleKey = (digit: string) => {
    if (pin.length < 4) setPin((p) => p + digit);
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
  };

  return (
    <section className="pin-layout">
      <div className="pin-content">
        <div className="pin-brand">
          <img src="/hashedin-logo.svg" alt="HashedIn by Deloitte" className="pin-logo" />
          <span className="pin-brand__divider" />
          <img src="/hi-engage-logo.svg" alt="Hi Engage" className="pin-logo pin-logo--hi" />
        </div>
        <div className="pin-titles">
          <span className="pin-event">Family Day</span>
          <span className="pin-year">2026</span>
        </div>
        <p className="pin-subtitle">Staff Check-In Portal</p>

        <div className={`pin-dots ${error ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`pin-dot ${i < pin.length ? (error ? 'error' : 'filled') : ''}`}
            />
          ))}
        </div>
        <p className={`pin-hint ${error ? 'error' : ''}`}>
          {error ? 'Incorrect PIN. Try again.' : 'Enter 4-digit access PIN'}
        </p>

        <div className="pin-keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => {
            if (key === '') {
              return <button key="blank" className="pin-key pin-key-blank" disabled />;
            }
            if (key === 'del') {
              return (
                <button key="del" className="pin-key pin-key-delete" onClick={handleDelete}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </button>
              );
            }
            return (
              <button key={key} className="pin-key" onClick={() => handleKey(key)}>
                {key}
              </button>
            );
          })}
        </div>
      </div>
      <p className="pin-demo-hint">
        Demo PIN: <strong>{EVENT.demoPin}</strong>
      </p>
    </section>
  );
}
