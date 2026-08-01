# SportMatrix — System Flow Documentation

---

# 1. Master Ecosystem Flow

```text
Public Website (HomePage)
  │
  ├──► Sport / Discovery selection (Category Bar, Search Capsule)
  │     │
  │     ├──► Browse Turfs (AllTurfsPage) ──► View Details (TurfDetailPage) ──► Slot Booking
  │     │
  │     └──► Explore Tournaments (TournamentListPage) ──► View Details (TournamentDetailPage)
  │
  ├──► Membership Plans (MembershipPage) ──► Plan Selection
  │
  └──► User Authentication (Login / Register / Role Selection)
        │
        ├──► SUPER ADMIN ──► SADashboard (Branches, Owners, Subscriptions, Analytics, Settings)
        │
        ├──► OWNER       ──► OwnerDashboard (Sports, Slots, Bookings, POS, Tournaments, Teams, Reports)
        │
        ├──► STAFF       ──► StaffDashboard (Bookings, Tournaments, Refunds, Maintenance, Equipment)
        │
        └──► CUSTOMER    ──► CustomerDashboard (Bookings, Teams, Matches, Wallet, Profile)
```

---

# 2. Customer Booking & Checkout Flow

```text
Browse Sports/Turf Listings (AllTurfsPage)
  │
  ├──► Filter by Location, Date, Time Slot (Search Capsule)
  │
  ├──► Open Turf Profile (TurfDetailPage)
  │     │
  │     ├──► View Sport Categories (Cricket, Football, Box Cricket, Badminton, Basketball)
  │     │
  │     └──► Select Available Time Slot Grid (SlotBookingPage)
  │
  ├──► Confirm Checkout
  │     │
  │     ├──► Select Payment Method (UPI, Wallet, Saved Cards)
  │     │
  │     └──► Apply active Membership discounts
  │
  └──► Booking Confirmed ──► View E-Ticket & QR code in "My Bookings"
```

---

# 3. Super Admin Operations Flow

```text
Super Admin Authentication
  │
  ├──► View Global Analytics (Total Branches, Revenue, Users, active Subscriptions)
  │
  ├──► Manage Branches (BranchManagement - Add, edit, activate, or suspend physical branches)
  │
  ├──► Manage Owners (OwnerManagement - Audit registered venue owners & approval requests)
  │
  ├──► Subscriptions & Plans (SubscriptionPlans - Edit pricing tiers, trial limits, features)
  │
  ├──► Financial Logs & Payments (PaymentLogs - Track commission payouts and SaaS revenue)
  │
  └──► System Settings (SystemSettings - API configs, system-wide parameters)
```

---

# 4. Venue Owner / Admin Operations Flow

```text
Owner Authentication
  │
  ├──► Dashboard Overview (Revenue, Bookings volume, inventory alerts)
  │
  ├──► Sports Config (SportsManagement - Configure sports active at the branch)
  │
  ├──► Slot Config & Pricing (SlotManagement - Generate timetable slots, set peak/regular pricing)
  │
  ├──► Bookings Manager (BookingManagement - View calendar, manual check-ins, cancel/reschedule)
  │
  ├──► POS Billing Engine (OwnerPOS - Sell drinks, snacks, accessories, and instant slot bills)
  │
  ├──► Tournaments Creator (TournamentManagement - Register teams, generate bracket trees)
  │
  ├──► Staff Manager (StaffManagement - Add/remove operators, assign shift access levels)
  │
  └──► Inventory & Maintenance (InventoryPage, MaintenancePage - Log bat/ball counts, track court repairs)
```

---

# 5. Staff/Operator Operations Flow

```text
Staff Authentication
  │
  ├──► Check-in Bookings (StaffBookings - Scan QR codes, confirm customer entry)
  │
  ├──► Tournament Coordinator (StaffTournaments - Enter match scores, update bracket trees)
  │
  ├──► Refunds & POS (StaffRefunds, StaffPOS - Handle quick customer snack orders or log cancellations)
  │
  └──► Equipment & Maintenance (StaffEquipment, StaffMaintenance - Report broken net/floodlights)
```

---

# 6. Customer Dashboard Flow

```text
Customer Authentication
  │
  ├──► Overview (Upcoming bookings, wallet balance, active stats)
  │
  ├──► My Bookings (View list of current and past turf bookings)
  │
  ├──► My Teams (Create or join teams, manage members roster, invite players)
  │
  ├──► My Matches (View match schedules, match histories, live and past scores)
  │
  ├──► Tournaments (Register for local tournaments, explore brackets and fixtures)
  │
  ├──► Wallet (Add money, view cashback balance and transactions history)
  │
  └──► Profile (Edit personal info, add favorite sports preferences, update security details)
```

---

**End of File — `Flow.md`**