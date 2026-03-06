import { useState, useEffect, useRef } from 'react';
import { useCheckInStore } from '@/stores/checkInStore';
import { useCheckIn } from '@/hooks/useCheckIn';
import { formatName } from '@/lib/helpers';

export function DuplicateOverlay() {
  const { currentGuest, dismissOverlay } = useCheckInStore();
  const { undo } = useCheckIn();
  const [step, setStep] = useState<1 | 2>(1);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStep(1);
    setCountdown(3);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentGuest?.id]);

  if (!currentGuest) return null;

  const fullName = formatName(currentGuest.firstName, currentGuest.lastName);
  const partyText = (() => {
    const a = currentGuest.adults;
    const k = currentGuest.kids;
    const s = currentGuest.seniors;
    let text = a + ' Adult' + (a !== 1 ? 's' : '');
    if (k > 0) text += ' + ' + k + ' Kid' + (k !== 1 ? 's' : '');
    if (s > 0) text += ' + ' + s + ' Senior' + (s !== 1 ? 's' : '');
    return text;
  })();

  const handleUndo = () => {
    undo.mutate(currentGuest.id, {
      onSuccess: () => {
        setStep(2);
        let c = 3;
        setCountdown(c);
        timerRef.current = setInterval(() => {
          c--;
          setCountdown(c);
          if (c <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            dismissOverlay();
          }
        }, 1000);
      },
    });
  };

  return (
    <>
      {/* Step 1: Already Checked In */}
      {step === 1 && (
        <div className="overlay-step">
          <div className="overlay-icon overlay-icon-amber icon-animate">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle className="warn-circle" cx="12" cy="12" r="10" />
              <line className="warn-line" x1="12" y1="8" x2="12" y2="12" />
              <circle className="warn-dot" cx="12" cy="16" r="0.5" fill="currentColor" />
            </svg>
          </div>
          <h2 className="overlay-title">Already Checked In</h2>
          <p className="overlay-sub">This guest was checked in earlier today</p>

          <div className="overlay-details">
            <div className="detail-row">
              <span className="detail-label">Name</span>
              <span className="detail-value">{fullName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Code</span>
              <span className="detail-value detail-code">{currentGuest.code}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Checked in at</span>
              <span className="detail-value detail-time">
                {currentGuest.checkedInAt
                  ? new Date(currentGuest.checkedInAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                  : '—'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Party</span>
              <span className="detail-value">{partyText}</span>
            </div>
          </div>

          <div className="overlay-actions">
            <button className="btn-outline btn-undo" onClick={handleUndo} disabled={undo.isPending}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline className="undo-arrow" points="1 4 1 10 7 10" />
                <path className="undo-arc" d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Undo Check-In
            </button>
            <button className="btn-outline btn-dismiss" onClick={dismissOverlay}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Step 2: Undone */}
      {step === 2 && (
        <div className="overlay-step">
          <div className="overlay-icon overlay-icon-blue icon-animate">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline className="undo-arrow" points="1 4 1 10 7 10" />
              <path className="undo-arc" d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </div>
          <h2 className="overlay-title">Check-In Undone</h2>
          <p className="overlay-sub">{fullName} is back to pending</p>

          <div className="overlay-details">
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value undo-status-value">Pending</span>
            </div>
          </div>

          <p className="overlay-dismiss-hint">Auto-closing in <span>{countdown}</span>s</p>
        </div>
      )}
    </>
  );
}
