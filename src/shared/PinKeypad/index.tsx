import { useCallback } from 'react';
import './index.scss';

interface PinKeypadProps {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}

export function PinKeypad({ value, onChange, maxLength = 4 }: PinKeypadProps) {
  const press = useCallback(
    (digit: string) => {
      if (value.length < maxLength) onChange(value + digit);
    },
    [value, onChange, maxLength]
  );

  const backspace = useCallback(() => {
    onChange(value.slice(0, -1));
  }, [value, onChange]);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="pin-keypad">
      <div className="pin-keypad__dots">
        {Array.from({ length: maxLength }, (_, i) => (
          <span key={i} className={`pin-keypad__dot ${i < value.length ? 'pin-keypad__dot--filled' : ''}`} />
        ))}
      </div>
      <div className="pin-keypad__grid">
        {keys.map((key, i) =>
          key === '' ? (
            <div key={i} />
          ) : key === 'del' ? (
            <button key={i} className="pin-keypad__key pin-keypad__key--del" onClick={backspace} aria-label="Delete">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          ) : (
            <button key={i} className="pin-keypad__key" onClick={() => press(key)}>
              {key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
