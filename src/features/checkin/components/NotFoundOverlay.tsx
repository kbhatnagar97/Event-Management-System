import { useCheckInStore } from '@/stores/checkInStore';

export function NotFoundOverlay() {
  const { dismissOverlay, setScreen } = useCheckInStore();

  const handleSearchManually = () => {
    dismissOverlay();
    setScreen('search');
  };

  return (
    <div className="overlay-step notfound-step">

      <div className="overlay-icon overlay-icon-red icon-animate">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line className="cross-line-1" x1="18" y1="6" x2="6" y2="18" />
          <line className="cross-line-2" x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <h2 className="overlay-title">Not Found</h2>
      <p className="overlay-sub">This code doesn't match any registration</p>

      {/* Search hint box */}
      <div className="notfound-hint-box">
        <svg className="notfound-hint-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span className="notfound-hint-text">Search by name, email, or code instead</span>
      </div>

      <div className="overlay-actions notfound-hint-row">
        <button className="btn-outline btn-dismiss" onClick={dismissOverlay}>Cancel</button>
        <button className="btn-primary btn-confirm" onClick={handleSearchManually}>
          Search Manually
        </button>
      </div>
    </div>
  );
}
