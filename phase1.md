# 🚀 PWA + Google Sheets Integration — Implementation Instructions

## 🎯 Current State

* Google Sheets API enabled
* Service account JSON downloaded
* Sheet shared with service account email
* Next.js app scaffolded (App Router)
* PWA base (manifest + installability) completed

---

# ✅ PHASE 1: Google Sheets Integration (Core Data Layer)

## 🔐 Required Credentials

You ONLY need:

### 1. Service Account JSON (Primary Credential)

This file contains:

* `client_email`
* `private_key`
* `project_id`

👉 This is the ONLY credential you should use server-side.

---

### ❌ Do NOT use:

* API Key (not needed for private sheet access)
* OAuth client (not needed for server-to-server)

---

## 🔧 Setup Steps

### 1. Store credentials securely

Create `.env.local`:

```env
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY="your-private-key"
GOOGLE_SHEET_ID=your-sheet-id
```

⚠️ Important:

* Replace `\n` properly in private key if needed

---

### 2. Install Google API client

```bash
npm install googleapis
```

---

### 3. Create Sheets client

```ts
import { google } from "googleapis";

export const getSheetsClient = () => {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
};
```

---

### 4. Fetch data from a tab

```ts
export const fetchSheet = async (range: string) => {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range,
  });

  return res.data.values || [];
};
```

---

# ⚡ PHASE 2: Data Fetching Strategy (NO CACHE)

## 🚫 Rules

* No caching of API data
* No ISR
* Always fetch fresh data

---

### In Next.js (App Router)

```ts
export const revalidate = 60; //60 or 30
```

OR

```ts
fetch(url, { cache: "no-store" });
```

---

## 🧠 Important

Do NOT:

* Cache API responses
* Store sheet data in service worker
* Use stale-while-revalidate

---

# 📦 PHASE 3: API Layer

Create route:

```
/app/api/sheets/[tab]/route.ts
```

---

### Example:

```ts
import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";

export async function GET(
  req: Request,
  { params }: { params: { tab: string } }
) {
  const data = await fetchSheet(params.tab);

  return NextResponse.json({ data });
}
```

---

# 🎨 PHASE 4: Directory UI (Next Step)

## Requirements

* Card-based layout
* Logo rendering
* Clickable cards
* Responsive grid

---

## Data Mapping

Each row from Sheets:

```ts
type Company = {
  name: string;
  logo: string;
  category: string;
  url: string;
};
```

---

# 🔍 PHASE 5: Search + Filters

## Requirements

* Client-side search (instant)
* Category filters
* No API calls for filtering

---

## Approach

* Load full dataset once per tab
* Store in React state
* Filter locally

---

# 📱 PHASE 6: PWA Optimization (NO DATA CACHE)

## Keep:

* Manifest
* Installability
* Static asset caching

## Remove:

* API caching
* JSON caching
* IndexedDB (for now)

---

## Service Worker Rule

```js
// DO NOT cache API calls
if (url.pathname.startsWith("/api/")) return;
```

---

# ⚠️ Common Mistakes to Avoid

## ❌ Using API Key instead of Service Account

→ Will fail for private sheets

## ❌ Not sharing sheet with service account

→ 403 error

## ❌ Incorrect private key formatting

→ Auth fails silently

## ❌ Mixing ISR + no-store

→ inconsistent data

## ❌ Caching API responses in service worker

→ stale UI bugs

---

# 🧭 What to Build Next (Priority Order)

1. ✅ Sheets API integration (all 8 tabs)
2. ✅ API routes per tab
3. ✅ Card UI rendering real data
4. ✅ Search + filters (client-side)
5. ⏳ Blog tab integration
6. ⏳ PWA polish (install prompt, offline fallback)

---

# 🔥 Final Architecture

* Google Sheets → Source of truth
* Next.js API → Data bridge
* React UI → Rendering layer
* PWA → Shell (no data caching)

---

# ✅ Definition of Done (Phase 1)

* All 8 tabs fetch correctly
* Data visible in UI
* No caching issues
* Live updates reflected instantly

---
