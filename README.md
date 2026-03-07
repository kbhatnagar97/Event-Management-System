# 🎉 Event Management System

A mobile-first web application for managing event **registration** and **check-in** for Family Day 2026. Built with React, TypeScript, and Vite.

---

## 📹 Demo

> End-to-end walkthrough of the Registration and Check-in flows (pre-SSO).

<video src="design/demo.webm" controls width="100%">
  Your browser does not support the video tag. <a href="design/demo.webm">Download the demo video</a>.
</video>

---

## ✨ Features

### Registration Flow
- **Email entry** — User provides their email to start registration
- **Form screen** — Collects attendee details (name, guests, seniors, etc.)
- **Confirmation screen** — Displays a QR code for event-day check-in

### Check-in Flow
- **PIN-protected access** — Staff enter a PIN to access the check-in kiosk
- **QR code scanning** — Scan attendee QR codes using the device camera (native `BarcodeDetector` + `jsQR` fallback)
- **Manual search** — Look up attendees by name or email
- **Duplicate detection** — Prevents double check-ins with a clear overlay
- **Success feedback** — Visual + audio confirmation on successful check-in
- **Not found handling** — Graceful UX when a QR code doesn't match any registration

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Routing | React Router v7 |
| State Management | Zustand |
| Server State | TanStack React Query |
| Styling | SCSS Modules |
| QR Generation | qrcode |
| QR Scanning | Native BarcodeDetector API + jsQR fallback |

---

## 📁 Project Structure

```
src/
├── api/              # API client with live/mock implementations
│   ├── live/         # Production API calls
│   └── mock/         # Mock API for local development
├── features/
│   ├── registration/ # Registration flow (Email → Form → Confirm)
│   └── checkin/      # Check-in flow (PIN → Scan/Search → Result)
├── hooks/            # Custom hooks (useCheckIn, useRegistration, etc.)
├── lib/              # Utilities, constants, QR helpers
├── shared/           # Reusable UI components (Button, Input, Overlay, etc.)
├── stores/           # Zustand stores
└── types/            # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173/familyday`.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📄 API Documentation

See [`design/API_CONTRACTS.md`](design/API_CONTRACTS.md) for the full API contract (v2.0).
