import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useCountdown } from '@/hooks/useCountdown';
import { drawQR } from '@/lib/qr';
import { EVENT } from '@/lib/constants';
import { pluralize } from '@/lib/helpers';

export function ConfirmScreen() {
  const store = useRegistrationStore();
  const navigate = useNavigate();
  const countdown = useCountdown();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && store.registrationCode) {
      void drawQR(canvasRef.current, store.registrationCode);
    }
  }, [store.registrationCode]);

  const confettiPieces = Array.from({ length: 30 }, (_, i) => (
    <div key={i} className="confetti" />
  ));

  return (
    <>
      {/* Confetti — behind the card, covers full viewport */}
      <div className="confetti-container">{confettiPieces}</div>

      <div className="reg-card reg-card--success">
      {/* Brand */}
      <div className="brand brand--sm">
        <img src="/hashedin-logo.svg" alt="HashedIn by Deloitte" className="brand__logo" />
        <span className="brand__divider" />
        <img src="/hi-engage-logo.svg" alt="Hi Engage" className="brand__logo brand__logo--hi" />
      </div>

      {/* Animated checkmark */}
      <div className="success-check">
        <svg className="checkmark" viewBox="0 0 52 52">
          <circle className="checkmark-bg" cx="26" cy="26" r="25" />
          <path className="checkmark-tick" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>

      <h2 className="success-heading">You're All Set!</h2>
      <p className="success-sub">See you at Family Day 2026</p>

      {/* Registration code (dark) */}
      <div className="unique-code">
        <span className="code-label">Your Registration Code</span>
        <span className="code-value">{store.registrationCode ?? '------'}</span>
        <div className="qr-wrapper">
          <canvas ref={canvasRef} width={220} height={220} />
        </div>
        <span className="code-hint">Scan this QR at the venue for quick check-in</span>
      </div>

      {/* Edit registration */}
      <button
        className="edit-link"
        onClick={() => navigate('/registration/form')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit Registration
      </button>

      {/* Summary */}
      <div className="summary">
        <span className="summary__badge">Registration Details</span>
        <div className="summary__grid">
          <div className="summary__cell">
            <span className="summary__label">Name</span>
            <span className="summary__value">{store.firstName} {store.lastName}</span>
          </div>
          <div className="summary__cell">
            <span className="summary__label">Email</span>
            <span className="summary__value">{store.email}</span>
          </div>
          <div className="summary__cell">
            <span className="summary__label">Adults</span>
            <span className="summary__value">{pluralize(store.adults, 'adult')}</span>
          </div>
          <div className="summary__cell">
            <span className="summary__label">Kids</span>
            <span className="summary__value">{pluralize(store.kids, 'kid')}</span>
          </div>
          <div className="summary__cell">
            <span className="summary__label">Senior Citizens</span>
            <span className="summary__value">{pluralize(store.seniors, 'senior citizen')}</span>
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="reminder">
        <div className="reminder__bar" />
        <div className="reminder__head">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Mark Your Calendar
        </div>
        <div className="reminder__grid">
          <div className="reminder__col">
            <span className="reminder__label">Date &amp; Time</span>
            <strong>{EVENT.date}</strong>
            <span className="reminder__detail">{EVENT.time}</span>
          </div>
          <div className="reminder__divider" />
          <div className="reminder__col">
            <span className="reminder__label">Location</span>
            <strong>{EVENT.venue}</strong>
            <span className="reminder__detail">{EVENT.venueDetail}</span>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="countdown">
        <span className="cd-label">Event starts in</span>
        <div className="cd-boxes">
          <div className="cd-box">
            <span className="cd-num">{countdown.days}</span>
            <span className="cd-unit">Days</span>
          </div>
          <span className="cd-sep">:</span>
          <div className="cd-box">
            <span className="cd-num">{countdown.hours}</span>
            <span className="cd-unit">Hours</span>
          </div>
          <span className="cd-sep">:</span>
          <div className="cd-box">
            <span className="cd-num">{countdown.mins}</span>
            <span className="cd-unit">Mins</span>
          </div>
          <span className="cd-sep">:</span>
          <div className="cd-box">
            <span className="cd-num">{countdown.secs}</span>
            <span className="cd-unit">Secs</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
