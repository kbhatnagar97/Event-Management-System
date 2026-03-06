import { useCheckInStore } from '@/stores/checkInStore';

export function NotFoundOverlay() {
  const { currentGuest, dismissOverlay, setScreen } = useCheckInStore();

  const handleSearchManually = () => {
    dismissOverlay();
    setScreen('search');
  };

  return (
    <div className="overlay-step">
      <div className="overlay-icon overlay-icon-red icon-animate">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line className="cross-line-1" x1="15" y1="9" x2="9" y2="15" />
          <line className="cross-line-2" x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h2 className="overlay-title">Not Found</h2>
      <p className="overlay-sub">No registration matches this code</p>

      <div className="overlay-details" style={{ textAlign: 'center', padding: '16px' }}>
        <span className="detail-label">Scanned code</span>
        <p className="detail-value detail-code" style={{ fontSize: '1.2rem', marginTop: '4px' }}>
          {currentGuest?.code || '—'}
        </p>
      </div>

      <div className="overlay-actions notfound-hint-row">
        <button className="btn-outline btn-dismiss" onClick={dismissOverlay}>Try Again</button>
        <button className="btn-primary btn-confirm" onClick={handleSearchManually}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search Manually
        </button>
      </div>
    </div>
  );
}
