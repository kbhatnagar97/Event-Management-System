import { useState, useEffect, useRef } from 'react';
import { useCheckInStore } from '@/stores/checkInStore';
import { useCheckIn } from '@/hooks/useCheckIn';
import { formatName, pluralize } from '@/lib/helpers';

export function SuccessOverlay() {
  const { currentGuest, editAdults, editKids, editSeniors, setEditAdults, setEditKids, setEditSeniors, dismissOverlay } = useCheckInStore();
  const { checkIn } = useCheckIn();
  const [step, setStep] = useState<1 | 2>(1);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset step when overlay opens; ensure dismissOverlay on unmount if timer active
  useEffect(() => {
    setStep(1);
    setCountdown(3);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        dismissOverlay();
      }
    };
  }, [currentGuest?.id, dismissOverlay]);

  const handleConfirm = () => {
    if (!currentGuest) return;
    checkIn.mutate(
      {
        guestId: currentGuest.id,
        adults: editAdults,
        kids: editKids,
        seniors: editSeniors,
        method: 'manual_code',
      },
      {
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
      }
    );
  };

  if (!currentGuest) return null;

  const total = editAdults + editKids + editSeniors;
  const partyText = (() => {
    let s = editAdults + ' Adult' + (editAdults !== 1 ? 's' : '');
    if (editKids > 0) s += ' + ' + editKids + ' Kid' + (editKids !== 1 ? 's' : '');
    if (editSeniors > 0) s += ' + ' + editSeniors + ' Senior' + (editSeniors !== 1 ? 's' : '');
    return s;
  })();

  return (
    <>
      {/* Step 1: Verify */}
      {step === 1 && (
        <div className="overlay-step">
          <div className="overlay-icon overlay-icon-green icon-animate">
            <svg className="tick-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline className="tick-path" points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="overlay-title">Guest Found</h2>
          <p className="overlay-sub">Verify details before check-in</p>

          <div className="overlay-details">
            <div className="detail-row">
              <span className="detail-label">Name</span>
              <span className="detail-value">{formatName(currentGuest.firstName, currentGuest.lastName)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Code</span>
              <span className="detail-value detail-code">{currentGuest.code}</span>
            </div>
          </div>

          <div className="edit-counters">
            <div className="edit-counter-row">
              <div className="edit-counter-info">
                <span className="edit-counter-label">Adults</span>
                <span className="edit-counter-hint">Registered: <strong>{currentGuest.adults}</strong></span>
              </div>
              <div className="edit-counter-controls">
                <button className="edit-counter-btn" onClick={() => setEditAdults(editAdults - 1)}>−</button>
                <span className={`edit-counter-num ${editAdults !== currentGuest.adults ? 'counter-changed' : ''}`}>{editAdults}</span>
                <button className="edit-counter-btn" onClick={() => setEditAdults(editAdults + 1)}>+</button>
              </div>
            </div>
            <div className="edit-counter-row">
              <div className="edit-counter-info">
                <span className="edit-counter-label">Kids</span>
                <span className="edit-counter-hint">Registered: <strong>{currentGuest.kids}</strong></span>
              </div>
              <div className="edit-counter-controls">
                <button className="edit-counter-btn" onClick={() => setEditKids(editKids - 1)}>−</button>
                <span className={`edit-counter-num ${editKids !== currentGuest.kids ? 'counter-changed' : ''}`}>{editKids}</span>
                <button className="edit-counter-btn" onClick={() => setEditKids(editKids + 1)}>+</button>
              </div>
            </div>
            <div className="edit-counter-row">
              <div className="edit-counter-info">
                <span className="edit-counter-label">Seniors</span>
                <span className="edit-counter-hint">Registered: <strong>{currentGuest.seniors}</strong></span>
              </div>
              <div className="edit-counter-controls">
                <button className="edit-counter-btn" onClick={() => setEditSeniors(editSeniors - 1)}>−</button>
                <span className={`edit-counter-num ${editSeniors !== currentGuest.seniors ? 'counter-changed' : ''}`}>{editSeniors}</span>
                <button className="edit-counter-btn" onClick={() => setEditSeniors(editSeniors + 1)}>+</button>
              </div>
            </div>
            <div className="edit-counter-total">
              <span>Total checking in</span>
              <span className="edit-total-num">{total}</span>
            </div>
          </div>

          <div className="overlay-actions">
            <button className="btn-outline btn-dismiss" onClick={dismissOverlay}>Cancel</button>
            <button className="btn-primary btn-confirm" onClick={handleConfirm} disabled={checkIn.isPending}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Confirm Check-In
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Confirmed */}
      {step === 2 && (
        <div className="overlay-step">
          <div className="overlay-icon overlay-icon-green icon-celebrate">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline className="tick-path" points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="overlay-title">Checked In!</h2>
          <p className="overlay-sub">Welcome, {currentGuest.firstName}!</p>

          <div className="overlay-details">
            <div className="detail-row">
              <span className="detail-label">Party</span>
              <span className="detail-value confirmed-party">{partyText}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time</span>
              <span className="detail-value detail-time">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>

          <p className="overlay-dismiss-hint">Auto-closing in <span>{countdown}</span>s</p>
        </div>
      )}
    </>
  );
}
