# 🏟️ SportMatrix — Project Progress & Architecture Report

> **Last Updated:** August 2026  
> **Status:** Active & Implemented (`main` branch)  
> **Repository:** `Hitesha-Borase/sportturf`

---

## 📌 Executive Summary
SportMatrix is a comprehensive turf arena booking, facility management, and team match orchestration platform. The system supports direct slot reservation, dynamic multi-hour durations, automated 5-split payment architecture, opponent team invitations, and full backend database persistence.

---

## 🚀 Key Completed Milestones

### 1. ⏱️ Direct Turf Booking (No Sport Friction)
- **Eliminated generic sport selection:** The booking flow starts directly on the chosen venue at **Step 1: Date & Time**, removing unnecessary football/cricket selection toggles.
- **Duration Pills Selector:** Added dynamic duration selection (`1 Hour`, `2 Hours`, `3 Hours`) directly in the header with instantaneous price recalculation (e.g., ₹800/hr $\times$ 2 hrs = ₹1,600).
- **Instant Slot Grid Selection:** 4-column available time slots (`06:00` to `22:00`) with immediate selection highlight (solid white background, bold black typography) and live summary line.

---

### 2. 💳 5-Payment Modes Architecture (Core Business Logic)

| Mode | Name | Business Logic & Workflow |
| :--- | :--- | :--- |
| **Mode A** | **Full Pay (Baseline)** | Captain pays 100% upfront (e.g., ₹1,800). Slot is locked immediately. Opponent team is invited for free with no financial obligation. |
| **Mode B** | **Split 50-50 (Main Request)** | Captain pays 50% (₹900). Unique payment link is generated and dispatched to the opponent captain via WhatsApp/SMS. Opponent has a 2-hour payment window; if unpaid, slot is released and captain is refunded ₹900. |
| **Mode C** | **Custom Split** | Interactive slider allows setting custom ratios (e.g., You pay ₹1,200, Opponent pays ₹600). Real-time share calculations. |
| **Mode D** | **Dare to Play — Loser Pays All** | Both teams pay a ₹100 refundable deposit. Match takes place; winning team gets their ₹100 deposit back, losing team pays the full ₹1,800 rent. Draw results in a 50-50 split. |
| **Mode E** | **Per-Player Split** | Rent is divided evenly per player (e.g., ₹1,800 ÷ 6 = ₹300/player). Generates individual payment links for teammates and opponents. |

---

### 3. 👥 Team Details, Opponent Invites & Guest Flow
- **Team Roster Management (Team A):** Captain details with `[✓ Paid]` tag, teammate roster with `[Pending]` / `[Paid]` badges, and interactive `+ Add teammate` input.
- **Opponent Team & Invite System:**
  - Opponent team name & opponent captain mobile number input with SMS/WhatsApp invite trigger.
  - **Open Challenge Toggle:** Allows captains without an opponent to broadcast the match to the public community feed.
- **Customer Identity & Account Linking:**
  - **Logged-in Users:** Auto-fills captain name, email, phone, and team details.
  - **Guest Bookings:** Collects Customer/Captain Name and Mobile Number during Step 3, generating a unique booking reference (`BMT-XXXXXX`). Mobile number acts as primary identity for tracking and account sync.

---

### 4. 🗄️ Backend Database Integration & State Sync
- **Transactional MySQL Booking API:** Connects with `POST http://localhost:5005/api/v1/bookings` to persist reservations in the `bookings` table.
- **Client Persistence:** Synchronizes booking records in local storage (`customer_bookings`), ensuring confirmed matches instantly appear on the **Customer Dashboard** (`/customer/bookings`).
- **Confirmation Screen (Step 4):** Displays match confirmation badge, venue summary, breakdown of captain vs opponent shares, Booking ID, and matchup cards (`[A] Ready` vs `[B] Pending`).

---

### 5. 🧭 Navigation & Auth Header Integration
- **Authenticated Navbar State:** Displays customer avatar, name/email badge, and direct **"My Bookings"** ticket button.
- **Venue Switching & Back Navigation:** "← Back to Turf Details" and "Switch Turf ▾" modal to quickly change arenas from within the booking stepper.

---

## 📂 Key Source Files & Routes

| File Path | Description |
| :--- | :--- |
| [`TurfDetailPage.jsx`](file:///c:/Kiaan/sportturf/turf%20Frontend/src/pages/website/TurfDetailPage.jsx) | Dedicated venue showcase page with integrated 4-step direct slot booking widget (`/turfs/:id`). |
| [`SlotBookingPage.jsx`](file:///c:/Kiaan/sportturf/turf%20Frontend/src/pages/website/SlotBookingPage.jsx) | Full-screen multi-step match creation and slot reservation page (`/booking/:id`). |
| [`Navbar.jsx`](file:///c:/Kiaan/sportturf/turf%20Frontend/src/components/Navbar.jsx) | Global navigation header with authentication status, My Bookings link, and admin switcher. |
| [`CustomerBookings.jsx`](file:///c:/Kiaan/sportturf/turf%20Frontend/src/pages/customer/CustomerBookings.jsx) | Customer booking history and match management dashboard (`/customer/bookings`). |
| [`bookings.controller.js`](file:///c:/Kiaan/sportturf/turf%20Backend/src/modules/bookings/bookings.controller.js) | Backend transactional booking controller for slot locking and database insertion. |

---

## 📋 Next Steps / Roadmap
- [ ] Connect live SMS / WhatsApp API gateway (e.g., Twilio / Gupshup / WhatsApp Business API) for instant opponent link delivery.
- [ ] Razorpay / Cashfree payment gateway webhook integration for real-time 50-50 split payment status webhooks.
- [ ] Tournament brackets & live match scoring integration.
