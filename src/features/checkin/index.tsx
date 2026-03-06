import { useCheckInStore } from '@/stores/checkInStore';
import { PinScreen } from './components/PinScreen';
import { ScannerScreen } from './components/ScannerScreen';
import { SearchScreen } from './components/SearchScreen';
import { SuccessOverlay } from './components/SuccessOverlay';
import { DuplicateOverlay } from './components/DuplicateOverlay';
import { NotFoundOverlay } from './components/NotFoundOverlay';
import './index.scss';

export function CheckInPage() {
  const { screen, authenticated, overlay, dismissOverlay } = useCheckInStore();

  return (
    <div className="ci-page">
      {/* PIN Screen */}
      {!authenticated && (
        <section className={`screen ${!authenticated ? 'active' : ''}`}>
          <PinScreen />
        </section>
      )}

      {/* Scanner Screen */}
      {authenticated && screen === 'scanner' && (
        <section className="screen active">
          <ScannerScreen />
        </section>
      )}

      {/* Search Screen */}
      {authenticated && screen === 'search' && (
        <section className="screen active">
          <SearchScreen />
        </section>
      )}

      {/* Overlays */}
      {overlay === 'success' && (
        <div className="overlay overlay-success active">
          <div className="overlay-backdrop" onClick={dismissOverlay} />
          <div className="overlay-card">
            <SuccessOverlay />
          </div>
        </div>
      )}

      {overlay === 'duplicate' && (
        <div className="overlay overlay-duplicate active">
          <div className="overlay-backdrop" onClick={dismissOverlay} />
          <div className="overlay-card">
            <DuplicateOverlay />
          </div>
        </div>
      )}

      {overlay === 'not_found' && (
        <div className="overlay overlay-notfound active">
          <div className="overlay-backdrop" onClick={dismissOverlay} />
          <div className="overlay-card">
            <NotFoundOverlay />
          </div>
        </div>
      )}
    </div>
  );
}
