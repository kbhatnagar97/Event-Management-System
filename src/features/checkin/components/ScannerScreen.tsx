import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useCheckInStore } from '@/stores/checkInStore';
import { useCheckInStats } from '@/hooks/useGuestSearch';
import { lookupCode as apiLookupCode } from '@/api/checkin';

/* ── Global type for the experimental BarcodeDetector API ── */
interface DetectedBarcode { rawValue: string }
interface BarcodeDetectorInstance {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new(opts: { formats: string[] }): BarcodeDetectorInstance;
}
declare const BarcodeDetector: BarcodeDetectorCtor | undefined;

type CameraStatus = 'initializing' | 'active' | 'denied' | 'error';

/*
 * ═══════════════════════════════════════════════════════════════
 *  QR DETECTION — HOW IT WORKS & WHY IT'S FAST
 * ═══════════════════════════════════════════════════════════════
 *
 *  YOUR QR CODE:
 *    Data          : 6-digit numeric code (e.g. "004323")
 *    QR Version    : 1 (the smallest — 21 × 21 modules)
 *    Error correct : H (30 % redundancy — very forgiving)
 *    Canvas size   : 220 × 220 px on the guest's phone
 *    Module size   : ~8.8 px on screen (220 ÷ 25 grid+margin)
 *
 *  AT THE CAMERA:
 *    Camera res    : 1280 × 720 (requested)
 *    QR in frame   : ~100–200 px wide (held at 15–30 cm)
 *    Each module   : ~5–10 px in raw camera pixels
 *
 *  DETECTION STRATEGY:
 *
 *    Path A — Native BarcodeDetector (Chrome 88+ / Edge / Android)
 *      • Pass <video> element directly → GPU zero-copy decode
 *      • ~1 ms per frame, handles any position / angle / distance
 *      • This is what Google Pay uses internally
 *
 *    Path B — jsQR fallback (Firefox / Safari / all browsers)
 *      • jsQR is pure JavaScript — scans every pixel
 *      • KEY INSIGHT: Don't shrink the whole 1280×720 frame — that
 *        destroys pixel density.  Instead, CROP the center of the
 *        frame (where the QR is) and feed raw pixels to jsQR.
 *      • Center crop 640×640 → QR keeps 5–10 px / module → instant
 *      • 640 × 640 = 410 K pixels → jsQR decodes in ~10 ms
 *
 *    Loop: continuous requestAnimationFrame with busy-guard
 *      • Decode every available frame, never stack async calls
 *      • ~30 fps with native detector, ~15–20 fps with jsQR
 * ═══════════════════════════════════════════════════════════════
 */

/** Max side of the square center-crop sent to jsQR. */
const CROP_MAX = 640;

/**
 * Decode a QR code from a live video frame.
 */
async function decodeFrame(
  video: HTMLVideoElement,
  cropCanvas: HTMLCanvasElement,
  cropCtx: CanvasRenderingContext2D,
  nativeDetector: BarcodeDetectorInstance | null,
): Promise<string | null> {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw === 0 || vh === 0) return null;

  /* ── Path A: Native BarcodeDetector — GPU, zero-copy, ~1 ms ── */
  if (nativeDetector) {
    try {
      const results = await nativeDetector.detect(video as unknown as ImageBitmapSource);
      if (results.length > 0 && results[0].rawValue) return results[0].rawValue;
    } catch { /* blank / transitional frames — ignore */ }
  }

  /* ── Path B: jsQR on a center-cropped square ──
     We crop the center of the camera frame at NATIVE resolution (no
     down-scaling) so each QR module keeps its full pixel density.
     A 640×640 crop = 410 K pixels → jsQR finishes in ~10 ms.
     For a 21×21 Version-1 QR, this is near-instant.              */
  const side = Math.min(vw, vh, CROP_MAX);
  const sx = Math.round((vw - side) / 2);
  const sy = Math.round((vh - side) / 2);

  if (cropCanvas.width !== side || cropCanvas.height !== side) {
    cropCanvas.width = side;
    cropCanvas.height = side;
  }

  // Draw only the center square — no scaling, native pixels
  cropCtx.drawImage(video, sx, sy, side, side, 0, 0, side, side);

  const imgData = cropCtx.getImageData(0, 0, side, side);
  const qr = jsQR(imgData.data, side, side, { inversionAttempts: 'dontInvert' });
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
     2. jsQR fallback (pure JS — works in Firefox/Safari/all)

     Note: A short delay before getUserMedia is intentional — React 19
     StrictMode double-mounts effects in dev (mount→unmount→mount).
     Without the delay the first mount acquires the camera, cleanup kills it,
     and the second mount's getUserMedia fires before the browser fully
     releases the device, causing silent failures or throttling. */
  useEffect(() => {
    let cancelled = false;
    let animId: number;
    let startDelay: ReturnType<typeof setTimeout>;
    let restartTimeout: ReturnType<typeof setTimeout>;

    async function startCamera() {
      /* Stop any previous stream before opening a new one */
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      /* ── 1. Get camera stream ── */
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            /* 720p is the sweet spot: enough pixels to decode QR codes from
               ~1 m away, but not so many that jsQR chokes. 1080p adds latency
               and autofocus is often slower at higher resolutions. */
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
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
      try {
        await video.play();
      } catch {
        /* play() can reject if the element was removed (StrictMode unmount) */
        if (cancelled) return;
      }
      if (cancelled) return;

      setCameraStatus('active');
      console.log('[QR Scanner] Camera active, resolution:', video.videoWidth, '×', video.videoHeight);

      /* ── 2b. Auto-restart if browser kills the stream (sleep, tab switch, etc.) ── */
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          if (cancelled) return;
          console.log('[QR Scanner] ⚠ Camera track ended — restarting…');
          setCameraStatus('initializing');
          cancelAnimationFrame(animId);
          restartTimeout = setTimeout(() => { if (!cancelled) startCamera(); }, 500);
        });
      }

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

      /* Offscreen canvas for jsQR center-crop (never added to DOM) */
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true })!;

      /* ── 4. Continuous scan loop ──
         Key insight from Google Pay-style scanners: DON'T throttle with a
         fixed interval.  Instead, decode every frame but use a "busy" guard
         so we never stack async decodes.  This way the scanner naturally runs
         at the fastest possible rate (~30 fps with native BarcodeDetector,
         ~15-20 fps with jsQR on the small canvas). */
      let decoding = false;

      function tick() {
        if (cancelled) return;
        animId = requestAnimationFrame(tick);

        /* Skip this frame if the previous decode hasn't finished yet
           or if a scan result is already being processed */
        if (decoding || scanLockRef.current) return;

        decoding = true;
        decodeFrame(video, cropCanvas, cropCtx, nativeDetector)
          .then((result) => {
            decoding = false;
            if (result && !scanLockRef.current && !cancelled) {
              console.log('[QR Scanner] ✅ Decoded:', result);
              scanLockRef.current = true;
              // Haptic tap — single firm pulse matching Google Pay
              if (navigator.vibrate) navigator.vibrate(35);
              lookupRef.current(result);
            }
          })
          .catch(() => { decoding = false; });
      }
      animId = requestAnimationFrame(tick);
    }

    /* ── Restart camera when tab becomes visible again ── */
    function handleVisibility() {
      if (document.visibilityState === 'visible' && !cancelled) {
        const track = streamRef.current?.getVideoTracks()[0];
        /* If stream is dead or track ended, restart */
        if (!track || track.readyState === 'ended') {
          console.log('[QR Scanner] Tab visible, camera dead — restarting…');
          setCameraStatus('initializing');
          scanLockRef.current = false;
          cancelAnimationFrame(animId);
          startCamera();
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    /* Delay start to survive React StrictMode double-mount
       (first mount cleanup runs before second mount's getUserMedia) */
    startDelay = setTimeout(() => { if (!cancelled) startCamera(); }, 100);

    return () => {
      cancelled = true;
      clearTimeout(startDelay);
      cancelAnimationFrame(animId);
      clearTimeout(restartTimeout);
      document.removeEventListener('visibilitychange', handleVisibility);
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

        {/* Google Pay-style viewfinder overlay */}
        <div className="scan-overlay">
          <div className="scan-region">
            <span className="scan-corner tl" />
            <span className="scan-corner tr" />
            <span className="scan-corner bl" />
            <span className="scan-corner br" />
          </div>
          <p className="scan-hint">Point your camera at a QR code</p>
        </div>

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
              <strong>{stats?.checkedIn ?? 0}</strong> / {stats?.total ?? 0} checked in
            </span>
            <span className="progress-pct">{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="action-btns">
          <button className="action-btn" onClick={() => setScreen('search')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
          </button>
          <button className="action-btn" onClick={toggleCodeEntry}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="14" y2="18" />
            </svg>
            Enter Code
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
