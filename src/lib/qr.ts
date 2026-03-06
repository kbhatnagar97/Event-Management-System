/**
 * QR Code utilities powered by the `qrcode` library.
 * MIT-licensed · 1.5 M+ weekly npm downloads · 0 known vulnerabilities
 *
 * Generates real, scannable QR codes that any QR reader / camera app
 * can decode back to the original registration code.
 */
import QRCode from 'qrcode';

/** Render a scannable QR code onto a <canvas> element. */
export async function drawQR(canvas: HTMLCanvasElement, text: string): Promise<void> {
  await QRCode.toCanvas(canvas, text, {
    width: canvas.width,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });
}

/** Return a Base-64 data-URL of the QR image (useful for downloads / sharing). */
export async function qrToDataURL(text: string, size = 280): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });
}
