import { useState, useRef } from 'react';
import { useCheckInStore } from '@/stores/checkInStore';
import { useCheckInStats } from '@/hooks/useGuestSearch';
import { lookupCode } from '@/api/checkin';

export function ScannerScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeEntryOpen, setCodeEntryOpen] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const store = useCheckInStore();
  const { data: stats } = useCheckInStats();

  const handleLookup = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    try {
      const { guest } = await lookupCode(code.trim());
      if (guest.status === 'checked_in') {
        store.showOverlay('duplicate', guest);
      } else {
        store.showOverlay('success', guest);
      }
      setCode('');
      setCodeEntryOpen(false);
    } catch {
      store.showOverlay('not_found', {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        code: code.trim(),
        adults: 0,
        kids: 0,
        seniors: 0,
        status: 'pending',
        createdAt: '',
      });
      setCode('');
      setCodeEntryOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleCodeEntry = () => {
    setCodeEntryOpen((o) => {
      if (!o) setTimeout(() => codeInputRef.current?.focus(), 100);
      return !o;
    });
  };

  const pct = stats ? (stats.total ? Math.round((stats.checkedIn / stats.total) * 100) : 0) : 0;

  return (
    <div className="scanner-layout">
      {/* Camera Viewfinder */}
      <div className="viewfinder">
        <div className="viewfinder-bg">
          <div className="camera-sim" />
        </div>
        <div className="scan-frame">
          <div className="scan-corner tl" />
          <div className="scan-corner tr" />
          <div className="scan-corner bl" />
          <div className="scan-corner br" />
          <div className="scan-line" />
        </div>
        <p className="scan-hint">Point camera at guest's QR code</p>
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
        <div className="progress-strip">
          <div className="progress-info">
            <span className="progress-text">
              <strong>{stats?.checkedIn ?? 0}</strong> / <span>{stats?.total ?? 0}</span> guests
            </span>
            <span className="progress-pct">{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="action-btns">
          <button className="action-btn" onClick={toggleCodeEntry}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Enter Code
          </button>
          <button className="action-btn" onClick={() => store.setScreen('search')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search Guest
          </button>
        </div>
      </div>

      {/* Code Entry Sheet */}
      {codeEntryOpen && (
        <div className="code-entry-overlay active">
          <div className="code-entry-backdrop" onClick={toggleCodeEntry} />
          <div className="code-entry-sheet">
            <div className="code-entry-handle" />
            <div className="code-entry-header">
              <span className="code-entry-title">Enter Registration Code</span>
              <button className="code-entry-close" onClick={toggleCodeEntry}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="code-entry-desc">Enter the 6-digit code shown on the guest's confirmation screen</p>
            <div className="code-entry-bar">
              <input
                ref={codeInputRef}
                className="code-entry-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
              <button className="code-entry-go" onClick={handleLookup} disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
