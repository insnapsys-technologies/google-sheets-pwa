# Phase 3: Blog + PWA + Deployment — Planning Instructions

## Objective
Extend the directory app into a fully installable Progressive Web App with a content layer (blog), offline capability, and production deployment.

This phase focuses on structuring content flow, installability, offline experience, and delivery — not implementation details.

---

## Core Features to Plan

### 1. Blog System (Google Sheets Driven)
- Introduce a dedicated tab in the Google Sheet as the single source of truth for blog content.
- Each row represents one blog post.

#### Content Structure Planning
Define required fields:
- Title
- Slug / Unique Identifier
- Publish Date
- Content Body (plain text or formatted)
- Featured Image (optional)
- Tags / Categories (optional)

#### Content Behavior
- Blog updates should reflect automatically (aligned with ISR strategy from Phase 1).
- Ensure consistency between directory data structure and blog structure.

#### Blog Experience
- Plan for:
  - Blog listing page (all posts)
  - Individual blog detail view
- Define:
  - Sorting (latest first)
  - Preview snippets vs full content
  - Navigation between posts

---

### 2. Blog UI/UX Integration
- Maintain the same **industrial, minimalist design system** used in the directory.

#### Key Considerations
- Clear separation between:
  - Directory content
  - Editorial/blog content
- Ensure:
  - Readability (typography, spacing)
  - Mobile-first reading experience
  - Smooth navigation between directory and blog

---

### 3. PWA Installability Planning
- The app should be installable on mobile home screens and desktop.

#### Define PWA Identity
- App name
- Short name
- App icon (multiple sizes)
- Theme color & background color

#### Install Experience
- Plan how users will:
  - Discover install option
  - Be prompted (or not prompted)
- Ensure:
  - Clean standalone app feel (no browser UI when launched)

---

### 4. Offline Experience Strategy
- Define what content is available offline.

#### Offline Scope
- Previously visited pages (directory cards, blog posts)
- Static UI shell

#### Behavior Planning
- Define:
  - What happens when user is offline and visits new content
  - Fallback UI (offline message, cached content view)

#### Performance Considerations
- Cache strategy should prioritize:
  - Fast loading
  - Data relevance (avoid stale confusion)

---

### 5. Navigation & App Shell Behavior
- Ensure consistent navigation across:
  - Directory
  - Blog
  - Offline states

#### Plan:
- Persistent layout structure (header, navigation)
- Smooth transitions between pages
- State retention where appropriate (filters, scroll, etc.)

---

### 6. Deployment Strategy (Vercel)
- Plan production deployment using Vercel.

#### Key Considerations
- Domain connection (custom domain)
- Automatic HTTPS (SSL)
- Environment configuration (API access, keys)

#### Deployment Flow
- Define:
  - Staging vs production environments
  - Update flow when Google Sheet changes
  - Rollback considerations (if needed)

---

### 7. Reliability & Performance Planning
- Ensure production-ready experience.

#### Focus Areas
- Fast initial load
- Stable navigation
- Consistent behavior across devices

---

### 8. Handoff Documentation Planning
- Final deliverable must include clear documentation for non-developers.

#### Documentation Sections

##### 1. Google Sheet Structure Guide
- Explain:
  - Required columns for directory tabs
  - Required columns for blog tab
  - Do’s and don’ts when editing

##### 2. Content Update Workflow
- Step-by-step:
  - How to add/edit companies
  - How to publish blog posts
- Clarify:
  - When changes go live (ISR timing)

##### 3. Deployment & Maintenance Guide
- High-level explanation of:
  - Hosting (Vercel)
  - Domain setup
- Instructions for:
  - Redeploying if needed
  - Basic troubleshooting

##### 4. Limitations & Best Practices
- Define:
  - Data limits (if any)
  - Image handling recommendations
  - Naming conventions

---

## Design Direction
- Maintain a **premium, industrial, minimal aesthetic**
- Blog should feel like a natural extension — not a separate product
- Emphasize:
  - Typography-driven design
  - Clean reading layouts
  - Subtle transitions

---

## Success Criteria
- Users can:
  - Read blog content seamlessly
  - Install the app on their device
  - Access previously viewed content offline
- System is:
  - Easy to update via Google Sheets
  - Stable in production
  - Clear to maintain without developer dependency

---

## Out of Scope (Important)
- No service worker implementation details
- No manifest configuration code
- No deployment scripts or CI/CD setup
- No UI component code

---

## Deliverable Expectation
A complete product-level plan that enables smooth transition from development to production, with zero ambiguity for implementation.