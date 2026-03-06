import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useCheckInStore } from '@/stores/checkInStore';
import { useCheckInStats } from '@/hooks/useGuestSearch';
import { lookupCode as apiLookupCode } from '@/api/checkin';

/* ── Global type for the experimental BarcodeDetector API ── */
interface DetectedBarcode { rawValue: string }
interface BarcodeDetectorInstance { detect(source: CanvasImageSource): Promise<DetectedBarcode[]> }
interface BarcodeDetectorCtor {
  new(opts: { formats: string[] }): BarcodeDetectorInstance;
}
declare const BarcodeDetector: BarcodeDetectorCtor | undefined;

type CameraStatus = 'initializing' | 'active' | 'denied' | 'error';

/**
 * Attempt to decode a QR from a video frame.
 * Strategy: use native BarcodeDetector when available (fast, GPU-accelerated),
 * fall back to jsQR (pure JS, works everywhere).
 */
async function decodeFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  nativeDetector: BarcodeDetectorInstance | null,
): Promise<string | null> {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (w === 0 || h === 0) return null;

  /* Size the offscreen canvas to match the video resolution */
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.drawImage(video, 0, 0, w, h);

  /* ── Strategy 1: Native BarcodeDetector (Chrome 88+, Edge 83+, Android) ── */
  if (nativeDetector) {
    try {
      const results = await nativeDetector.detect(canvas);
      if (results.length > 0 && results[0].rawValue) {
        return results[0].rawValue;
      }
    } catch { /* detector may throw on invalid frames — ignore */ }
  }

  /* ── Strategy 2: jsQR (pure JS, works everywhere) ── */
  const imgData = ctx.getImageData(0, 0, w, h);
  const qr = jsQR(imgData.data, w, h, { inversionAttempts: 'dontInvert' });
  return qr?.data ?? null;
}

export function ScannerScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeEntryOpen, setCodeEntryOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('initializing');
  const codeInputRef = useRef<HTMLInputElement>(null);
  const scanLockRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* Select only stable action refs from the store */
  const showOverlay = useCheckInStore((s) => s.showOverlay);
  const setScreen = useCheckInStore((s) => s.setScreen);
  const overlay = useCheckInStore((s) => s.overlay);
  const { data: stats } = useCheckInStats();

  /* Reset scan-lock when overlay is dismissed so next scan can fire */
  useEffect(() => {
    if (!overlay) scanLockRef.current = false;
  }, [overlay]);

  /* Shared lookup logic — used by both QR scan & manual code entry.
     Stored in a ref so the camera effect never re-runs when it changes. */
  const performLookup = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      try {
        const { guest } = await apiLookupCode(trimmed);
        if (guest.status === 'checked_in') {
          showOverlay('duplicate', guest);
        } else {
          showOverlay('success', guest);
        }
      } catch {
        showOverlay('not_found', {
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          code: trimmed,
          adults: 0,
          kids: 0,
          seniors: 0,
          status: 'pending',
          createdAt: '',
        });
      }
    },
    [showOverlay],
  );
  const lookupRef = useRef(performLookup);
  useEffect(() => { lookupRef.current = performLookup; });

  /* ── Camera + QR scan loop ──
     Uses getUserMedia directly (no html5-qrcode) + dual decoder:
     1. Native BarcodeDetector (Chrome/Edge — hardware-accelerated)
     2. jsQR fallback (pure JS — works in Firefox/Safari/all) */
  useEffect(() => {
    let cancelled = false;
    let animId: number;

    async function start() {
      /* ── 1. Get camera stream ── */
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = ((err as Error)?.message ?? '').toLowerCase();
        setCameraStatus(
          msg.includes('permission') || msg.includes('denied') || msg.includes('notallowed')
            ? 'denied'
            : 'error',
        );
        return;
      }

      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;

      /* ── 2. Attach to <video> ── */
      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach((t) => t.stop()); return; }
      video.srcObject = stream;
      await video.play();
      if (cancelled) return;

      setCameraStatus('active');
      console.log('[QR Scanner] Camera active, resolution:', video.videoWidth, '×', video.videoHeight);

      /* ── 3. Set up decoders ── */
      let nativeDetector: BarcodeDetectorInstance | null = null;
      try {
        if (typeof BarcodeDetector !== 'undefined') {
          nativeDetector = new BarcodeDetector({ formats: ['qr_code'] });
          console.log('[QR Scanner] Using native BarcodeDetector ✓');
        }
      } catch { /* not available */ }
      if (!nativeDetector) {
        console.log('[QR Scanner] Native BarcodeDetector not available, using jsQR fallback');
      }

      /* Offscreen canvas for frame capture — never added to DOM */
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })!;

      /* ── 4. Scan loop ── */
      let lastScanTime = 0;
      const SCAN_INTERVAL = 150; /* ms between decode attempts — ~6–7 fps */

      function tick(now: number) {
        if (cancelled) return;
        animId = requestAnimationFrame(tick);

        if (now - lastScanTime < SCAN_INTERVAL) return;
        lastScanTime = now;
        if (scanLockRef.current) return;

        decodeFrame(video, offCanvas, offCtx, nativeDetector).then((result) => {
          if (result && !scanLockRef.current && !cancelled) {
            console.log('[QR Scanner] ✅ Decoded:', result);
            scanLockRef.current = true;
            lookupRef.current(result);
          }
        });
      }
      animId = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  /* Manual code entry lookup */
  const handleManualLookup = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    await performLookup(code.trim());
    setCode('');
    setCodeEntryOpen(false);
    setLoading(false);
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
      {/* Camera Viewfinder — direct <video> element, no library */}
      <div className="viewfinder">
        <video
          ref={videoRef}
          className="scanner-video"
          autoPlay
          playsInline
          muted
        />

        {/* Camera status indicators */}
        {cameraStatus === 'initializing' && (
          <div className="camera-status">
            <div className="camera-status-spinner" />
            <p>Starting camera…</p>
          </div>
        )}
        {cameraStatus === 'denied' && (
          <div className="camera-status">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 7.5 21 3M21 3l-4.5 4.5M21 3v4.5" />
              <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <p>Camera access denied</p>
            <span className="camera-status-hint">
              Allow camera permission in your browser settings, then reload.
            </span>
          </div>
        )}
        {cameraStatus === 'error' && (
          <div className="camera-status">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--red, #e74c3c)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p>Camera not available</p>
            <span className="camera-status-hint">
              Use "Enter Code" below to check in manually.
            </span>
          </div>
        )}
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
          <button className="action-btn" onClick={() => setScreen('search')}>
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
                onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
              />
              <button className="code-entry-go" onClick={handleManualLookup} disabled={loading}>
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
