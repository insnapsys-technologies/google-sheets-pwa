# PWA Install Modal — Copilot Agent Instructions

## Goal
Build a reusable `<InstallPromptModal />` component for a Next.js (App Router) application.
The modal should appear on the user's **first visit**, guide them to install the PWA, and **never appear again** once they have installed or dismissed it.

---

## Behavior Requirements

### When to Show the Modal
- Show the modal only when ALL of the following are true:
  - The app is NOT already running in standalone mode (i.e., not already installed)
  - `localStorage` does NOT have the key `pwa-prompt-dismissed` set to `"true"`
  - On Android: the `beforeinstallprompt` event has fired (browser is ready to install)
  - On iOS: the user is on a Safari browser on an iOS device
  - On Windows: the `beforeinstallprompt` event has fired (Chrome/Edge on desktop)

### When to Hide the Modal Permanently (set the localStorage flag)
- **Android**: When the native `appinstalled` event fires — this means the user actually installed the app
- **iOS**: When the user taps the "Done" or "Close" button on the modal — since iOS provides no install event
- **Windows**: When the native `appinstalled` event fires — same as Android
- Also hide (but do NOT set the flag) if the user dismisses without installing — show again next visit (optional: set a "snooze" counter if you want to limit re-prompts)

### Standalone Mode Check
- At the very top of the component logic, check `window.matchMedia('(display-mode: standalone)').matches`
- If this returns `true`, do not render the modal at all — the app is already installed and running from home screen

---

## Platform Detection Logic

### Android Detection
- The `beforeinstallprompt` event fires on Chrome for Android
- Capture this event using `window.addEventListener('beforeinstallprompt', handler)`
- Call `event.preventDefault()` to suppress the browser's default mini install bar
- Store the event reference in state — this is needed to trigger the native install dialog later
- Listen for `window.addEventListener('appinstalled', handler)` to detect successful installation

### iOS Detection
- Check `navigator.userAgent` for the strings `iPad`, `iPhone`, or `iPod`
- Also verify `!(window as any).MSStream` to exclude Windows Phone false positives
- iOS does NOT support `beforeinstallprompt` or `appinstalled` events — no native prompt is available
- The install must be done manually by the user via Safari's Share menu

### Windows Detection
- Windows PWA install is also triggered by the `beforeinstallprompt` event (Chrome or Edge)
- Detection logic is identical to Android — the same event and `appinstalled` listener apply
- Optionally detect Windows OS via `navigator.userAgent` containing `Win` if you want to show Windows-specific instructions in the modal UI

---

## Component Structure

### File Location
- Create the component at `components/InstallPromptModal.tsx`
- Mark it as a Client Component with `'use client'` at the top

### State Variables Needed
- `showModal` — boolean, controls modal visibility
- `deferredPrompt` — stores the captured `beforeinstallprompt` event object
- `platform` — one of `'android'`, `'ios'`, `'windows'`, or `'other'`
- `isStandalone` — boolean, whether app is already installed

### Effects Needed
- On mount: check standalone mode, check localStorage flag, detect platform, attach event listeners
- Cleanup: remove all event listeners on unmount

---

## User Interactions

### Install Button (Android and Windows)
- Clicking "Install" should call `.prompt()` on the stored `deferredPrompt` event
- After calling `.prompt()`, await `deferredPrompt.userChoice`
- If `userChoice.outcome === 'accepted'`, set the localStorage flag and close the modal
- If `userChoice.outcome === 'dismissed'`, close the modal but do NOT set the flag (so it can show again later)

### Close / Done Button (iOS)
- Clicking close sets the localStorage flag and hides the modal
- This is the only signal available on iOS to know the user has seen the instructions

### Backdrop Click
- Clicking outside the modal should dismiss it without setting the localStorage flag (treat as a snooze)

---

## Modal UI Content Per Platform

### Android Modal Content
- Title: "Install Our App"
- Body: Explain that tapping Install will add the app to their home screen
- Primary button: "Install" — triggers the native prompt
- Secondary button: "Not Now" — dismisses without setting flag

### iOS Modal Content
- Title: "Install Our App"
- Body: Step-by-step instructions:
  1. Tap the Share button (the box with an arrow pointing up) in Safari's toolbar
  2. Scroll down and tap "Add to Home Screen"
  3. Tap "Add" in the top right corner
- Show the Share icon visually using an emoji or inline SVG
- Primary button: "Done" — sets the localStorage flag and closes the modal

### Windows Modal Content
- Title: "Install Our App"
- Body: Explain that clicking Install will add the app to their desktop and Start menu
- Primary button: "Install" — triggers the native prompt (same as Android)
- Secondary button: "Not Now" — dismisses without setting flag

---

## localStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `pwa-prompt-dismissed` | `"true"` | Set when user installs (Android/Windows) or dismisses iOS instructions. Prevents modal from showing again. |

---

## Integration

### Where to Mount the Component
- Import and render `<InstallPromptModal />` inside `app/layout.tsx`
- Place it at the end of the `<body>`, outside of page content, so it overlays everything

### Prerequisites
- The app must have a valid `app/manifest.ts` file (required for `beforeinstallprompt` to fire)
- The app must be served over HTTPS (required for service workers and install prompts)
- A service worker must be registered (even a minimal `public/sw.js` is sufficient)

---

## Edge Cases to Handle

- If `beforeinstallprompt` never fires (e.g., browser doesn't support it, or app is already installed), do not show the modal for Android/Windows
- If the user is on Firefox on Android, `beforeinstallprompt` may not fire — silently skip
- If the user is on an iOS device but using Chrome (not Safari), PWA install is not supported on iOS Chrome — skip the modal
  - Detect Safari on iOS by checking that `navigator.userAgent` does NOT contain `CriOS` (Chrome on iOS) or `FxiOS` (Firefox on iOS)
- If `localStorage` is unavailable (private browsing on some browsers), wrap all localStorage access in try/catch and fail silently — default to not showing the modal

---

## What NOT to Do

- Do NOT use the `beforeinstallprompt` approach on iOS — it does not exist there
- Do NOT show the modal if the app is already running standalone
- Do NOT set the dismissed flag just because the user clicked outside or hit "Not Now" — they should have a chance to install on a future visit
- Do NOT import this component as a Server Component — it must be `'use client'`
- Do NOT call `deferredPrompt.prompt()` more than once — the event can only be used one time