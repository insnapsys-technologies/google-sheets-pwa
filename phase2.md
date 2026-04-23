# Phase 2: Directory UI & Interaction — Planning Instructions

## Objective
Build the core user-facing directory experience by transforming structured Google Sheet data into a fast, searchable, and mobile-responsive card-based interface.

This phase focuses strictly on UI behavior, data presentation, and interaction design — not backend integration or deployment.

---

## Core Features to Plan

### 1. Multi-Tab Directory Structure
- Represent all 8 Google Sheet tabs as unified or switchable data views.
- Ensure consistency in how each tab is interpreted and displayed.
- Decide whether:
  - Tabs are merged into one searchable dataset, OR
  - Tabs remain distinct with user-controlled switching.

---

### 2. Card-Based UI System
- Each company entry should be displayed as a card.
- Cards must include:
  - Company logo (primary visual anchor)
  - Key identifying information (name, category, etc.)
- Cards should be:
  - Clickable (entire surface area interactive)
  - Consistent in size and spacing
  - Designed for quick scanning

---

### 3. Logo Rendering Strategy
- Logos are critical for visual identity.
- Plan for:
  - Consistent aspect ratio handling
  - Graceful fallback if logo is missing or broken
  - Optimization mindset (lazy loading, responsive sizing)

---

### 4. Category Filtering System
- Users must be able to filter entries efficiently.
- Define:
  - Filter types (single-select vs multi-select)
  - Filter location in UI (top bar, sidebar, chips, etc.)
- Ensure:
  - Filters work across all 8 tabs consistently
  - Instant feedback when filters are applied
  - Clear indication of active filters

---

### 5. Search Experience (Client-Side)
- Implement a fast, real-time search system.
- Key considerations:
  - Instant results as user types (no delay)
  - Search across relevant fields (name, category, tags, etc.)
  - Combine seamlessly with filters
- Define behavior for:
  - No results state
  - Partial matches
  - Case insensitivity

---

### 6. Responsive Grid Layout
- Design a flexible grid system that adapts across:
  - Mobile (single column priority)
  - Tablet (2–3 columns)
  - Desktop (multi-column layout)
- Ensure:
  - Consistent spacing and alignment
  - No layout shifts during loading
  - Smooth resizing across breakpoints

---

### 7. Interaction & UX Behavior
- Clicking a card should:
  - Navigate to a detail view OR external link
- Define:
  - Hover states (desktop)
  - Tap feedback (mobile)
  - Loading states (skeletons or placeholders)

---

### 8. Performance Considerations (Planning Level)
- UI must feel instant and fluid.
- Plan for:
  - Minimal re-renders
  - Efficient state handling for filters + search
  - Avoiding unnecessary data duplication

---

## Design Direction
- Maintain a **minimalist, high-end industrial aesthetic**
- Prioritize:
  - Clean typography
  - Strong spacing system
  - Subtle interactions (not flashy)
- Visual hierarchy should guide scanning behavior

---

## Success Criteria
- Users can:
  - Instantly scan companies via cards
  - Quickly filter and search results
  - Navigate seamlessly across devices
- Interface feels:
  - Fast
  - Clean
  - Intuitive

---

## Out of Scope (Important)
- No API integration logic
- No Next.js implementation details
- No component-level code
- No deployment or PWA setup

---

## Deliverable Expectation
A fully defined UI/UX plan that can be directly translated into implementation without ambiguity.