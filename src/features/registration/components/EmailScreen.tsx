import { useState } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useRegistration } from '@/hooks/useRegistration';
import { isDeloitteEmail } from '@/lib/helpers';
import { EVENT } from '@/lib/constants';
import { Button } from '@/shared/Button';
import { Input } from '@/shared/Input';

export function EmailScreen() {
  const { email, setEmail } = useRegistrationStore();
  const { verify } = useRegistration();
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!isDeloitteEmail(email)) {
      setError('Please use your Deloitte email');
      return;
    }
    setError('');
    verify.mutate(email);
  };

  return (
    <div className="reg-card">
      {/* Brand */}
      <div className="brand">
        <img src={`${import.meta.env.BASE_URL}hashedin-logo.svg`} alt="HashedIn by Deloitte" className="brand__logo" />
        <span className="brand__divider" />
        <img src={`${import.meta.env.BASE_URL}hi-engage-logo.svg`} alt="Hi Engage" className="brand__logo brand__logo--hi" />
      </div>

      {/* Hero */}
      <div className="hero">
        <p className="hero__overline">You're Invited</p>
        <h1 className="hero__title">
          <span className="hero__word" style={{ animationDelay: '0.25s' }}>Family</span>
          <span className="hero__word hero__word--accent" style={{ animationDelay: '0.35s' }}>
            Day <em className="hero__year">2026</em>
          </span>
        </h1>
        <p className="hero__tagline">Creating memories that last forever</p>
      </div>

      {/* Event info */}
      <div className="event-info">
        <div className="event-info__item">
          <div className="event-info__icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <span className="event-info__label">Date</span>
            <span className="event-info__value">{EVENT.date}</span>
          </div>
        </div>

        <div className="event-info__sep" />

        <div className="event-info__item">
          <div className="event-info__icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span className="event-info__label">Time</span>
            <span className="event-info__value">{EVENT.time}</span>
          </div>
        </div>

        <div className="event-info__sep" />

        <div className="event-info__item">
          <div className="event-info__icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <span className="event-info__label">Venue</span>
            <span className="event-info__value">{EVENT.venue}</span>
          </div>
        </div>
      </div>

      {/* Email input */}
      <div style={{ marginBottom: 16 }}>
        <Input
          id="email"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
          type="email"
          placeholder="Enter your @deloitte.com email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error || (verify.isError ? 'Something went wrong, please try again' : undefined)}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        />
      </div>

      <Button
        variant="primary"
        onClick={handleContinue}
        loading={verify.isPending}
        style={{ width: '100%' }}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        }
      >
        Continue with Email
      </Button>
    </div>
  );
}
