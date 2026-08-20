# SportMatrix Frontend Workflow & System Architecture

A comprehensive documentation of the **SportMatrix** frontend web application architecture, user journeys, 4-step booking wizard engine, data storage models, and recent updates.

---

## 🚀 1. Technology Stack & Core Framework

- **Frontend Framework**: React 18 + Vite (ESBuild bundler)
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS3 + Tailwind CSS (Custom Dark Mode & High-Contrast Aesthetics)
- **Icons**: React Icons (`hi`, `hi2`, `fi`, `tb`)
- **State & Auth Context**: React Context API (`AuthContext`, `ToastContext`)
- **API & Offline Resiliency**: Axios with ultra-fast fallback mechanisms (<300ms network timeout)

---

## 👥 2. User Roles & Workflows

### 🟢 A. Guest User (No Authentication Required)
1. **Browse Turfs**: Views available turf complexes, hourly pricing, ratings, and location filters.
2. **Slot Selection**: Selects date, duration, and desired hourly time slots with dynamic pricing.
3. **Payment & Receipt**: Completes payment (Full Pay, Split Pay, Dare to Play, or Per-Player Split).
4. **Receipt Generation**: Receives a scannable digital receipt (`BMT-XXXXX`) with WhatsApp share options.
5. **Data Isolation**: Guest receipts are stored in dedicated `guest_bookings` local storage and are **never attached** to logged-in customer accounts.

### 🔵 B. Logged-in Customer
1. **Personal Dashboard**: Accesses `/customer` to view personal bookings, wallet balance, and upcoming matches.
2. **Leaderboard & Match Scores**: Tracks Player Performance Score (PPS), verified match wins, and captain handshake ratings.
3. **My Bookings History**: Views filtered customer bookings (`customer_bookings`), excluding unauthenticated guest receipts.

### 🟡 C. Turf Owner & Staff
1. **POS & Booking Management**: Manages offline/online bookings via `OwnerPOS` and `BookingManagement`.
2. **Turf Lead CRM & Calendar**: Views live calendar slots, customer leads, and assigned ground matches.
3. **Equipment & Maintenance**: Tracks inventory, staff duty logs, and branch settings.

### 🟣 D. Certified Umpire
1. **Official Duty Queue**: Accesses `/umpire` to view assigned matches, captain contacts, and live scorecards.
2. **UPI Payment QR**: Displays registered referee payment QR code (`rajesh.umpire@okhdfcbank`) for direct on-duty collection.

---

## 🏟️ 3. Core 4-Step Booking Engine Workflow

```
[ Step 1: Date & Time ] ➔ [ Step 2: Payment Mode ] ➔ [ Step 3: Teams & Lock ] ➔ [ Step 4: Confirmation ]
```

### 1️⃣ Step 1: Date & Time Selection
- Interactive date bar and multi-hour slot selection.
- Hourly pricing dynamically scales based on the selected venue's base price (`activeTurf.price`).
- Live highlights for multi-hour continuous bookings.

### 2️⃣ Step 2: Payment Mode Selection
Supports 5 flexible split-payment modes:
- **Full Pay**: 100% paid upfront by the booking user.
- **Split 50-50**: 50% paid now, 50% link generated for opponent team.
- **Custom Split**: Custom user-defined percentage split (e.g. 30% / 70%).
- **Per-Player Split**: Equal payment split among customizable player counts (4, 6, 8, 10, 12, 14, 16 players).
- **Dare to Play**: 30% deposit to lock the slot with an open challenge.

### 3️⃣ Step 3: Match & Team Lock
- Enter Captain Name, Mobile Number, Team A, and optional Team B (or Open Challenge).
- **Navigation Guard**: Unapproved future steps (`Step 3` / `Step 4`) are locked (`disabled={isFuture}`) with visual indicator (`cursor-not-allowed opacity-50`).

### 4️⃣ Step 4: Confirmation & Receipt
- Displays payment breakdown, match ID, venue location, and quick share links.
- **Smart Navigation**:
  - Logged-in Customers see **"View My Bookings →"** (routes to `/customer/bookings`).
  - Guests see **"Explore More Turfs →"** (routes to `/turfs`).

---

## 🔄 4. Latest Updates & Improvements Summary

### ❌ 1. Facility Amenities Cleaned Across Application
- Removed all "FACILITY AMENITIES" tags, icon strips, and filter options from `TurfDetailPage`, `AllTurfsPage`, `TurfCard`, and `TurfCardPremium`.

### 🔒 2. Step Wizard Navigation Protection
- Disabled out-of-order clicking on future unapproved wizard step buttons (`3. Teams`, `4. Confirm`). Past completed steps remain clickable (`✓`) for backward stepping.

### 🔀 3. Dynamic Turf Switch Modal Integration
- Connected the `"Switch Turf ▾"` button to `VenueSwitchModal.jsx` across detail and slot booking pages.
- Dynamic venue switching updates state, URL routes (`/turf/:id`), and pricing grids instantly.

### 💸 4. Venue-Based Dynamic Slot Pricing
- Replaced static slot pricing with dynamic rate generators scaling from `selectedVenue.price` / `activeTurf.price`.

### 🛡️ 5. Strict Guest vs Customer Data Segregation
- Unauthenticated guest bookings are stored in `guest_bookings` and automatically filtered out of customer account dashboards.

### ⚡ 6. Ultra-Fast API Fallback Timeouts (300ms)
- Reduced global Axios API timeout from **2,500ms down to 300ms** in `api.js`, `tournamentService.js`, and `subscriptionPlanService.js`.
- Pages load **instantly (8x faster)** when backend servers are offline.

---

## 💾 5. Local Storage Data Schema

| Storage Key | Role | Usage |
| :--- | :--- | :--- |
| `customer_bookings` | Logged-in Customer | User-bound match bookings |
| `guest_bookings` | Guest User | Isolated unauthenticated guest receipts |
| `customer_profile` | Customer Profile | Active customer name, phone, avatar, and stats |
| `user` / `token` | Auth Session | Logged-in user role, JWT token, and email |
| `venue_switches` | Booking Engine | Currently selected venue ID and branch |

---

*Document Generated: 2026-08-15 | Application: SportMatrix Frontend*
