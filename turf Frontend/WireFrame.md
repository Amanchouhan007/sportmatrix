# SportMatrix — Wireframe Documentation

---

# 1. Public Website Layout

```text
┌────────────────────────────────────────────────────────────────────────┐
│  [Logo] SportMatrix   Home   Turfs   Tournaments   Membership   Contact   [Login] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   🏆 PLAY, COMPETE AND EXCELL IN THE SPORTS ECOSYSTEM                  │
│   Book premium fields, join leagues, and stream gaming sessions.       │
│                                                                        │
│     [ Book a Turf ]   [ Discover Tournaments ]   [ Explore Gaming ]    │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ 📍 Location    📅 Select Date    ⏰ Time Slot     [ Search ] │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│   CATEGORIES:  ⚽ Football   🏏 Cricket   🏏 Box Cricket   🏸 Badminton│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   FEATURED TURFS                                                       │
│   ┌───────────────────────────┐ ┌───────────────────────────┐          │
│   │ [Image: Green Arena]      │ │ [Image: ProKick Turf]      │          │
│   │ ⭐ 4.8  (Mumbai)          │ │ ⭐ 4.6  (Bangalore)        │          │
│   │ Football · ₹1200/hr       │ │ Cricket · ₹1500/hr        │          │
│   │ [ Book Slot Now ]         │ │ [ Book Slot Now ]         │          │
│   └───────────────────────────┘ └───────────────────────────┘          │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│   ACTIVE TOURNAMENTS                                                   │
│   ┌───────────────────────────┐ ┌───────────────────────────┐          │
│   │ Premier Cricket League    │ │ Monsoon Football Cup      │          │
│   │ 💰 Prize Pool: ₹50,000    │ │ 💰 Prize Pool: ₹25,000    │          │
│   │ Slots: 2/16 Left          │ │ Slots: 5/8 Left           │          │
│   │ [ Join League ]           │ │ [ Join League ]           │          │
│   └───────────────────────────┘ └───────────────────────────┘          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Super Admin Dashboard (SADashboard) Layout

```text
┌────────────────────────────────────────────────────────────────────────┐
│  [Search...]                                                   🔔 [S]  │
├────────────────────────────────────────────────────────────────────────┤
│  Dashboard  (System-wide overview)                  [ 30 Days 🔽 ]      │
│                                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │Total Branches│ │Total Revenue │ │ Total Users  │ │Active Subscr.│   │
│  │    126       │ │ ₹2,45,00,000 │ │    9,540     │ │     42       │   │
│  │↑ Platform    │ │ ↓ +18.4%     │ │↑ Registered  │ │↑ Running     │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                        │
│  ┌───────────────────────────────┐ ┌───────────────────────────────┐   │
│  │ Revenue Growth (Bar Chart)    │ │ Commission Earnings (Line)    │   │
│  │                               │ │                               │   │
│  │    █   █   █   █   █   █      │ │        .──*──.──.             │   │
│  │  █ █ █ █ █ █ █ █ █ █ █ █      │ │     .─*          *─.          │   │
│  │  Jan Feb Mar Apr May Jun      │ │  Jan Feb Mar Apr May Jun      │   │
│  └───────────────────────────────┘ └───────────────────────────────┘   │
│                                                                        │
│  ┌───────────────────────────────┐ ┌───────────────────────────────┐   │
│  │ Branch Performance            │ │ Recent Activities             │   │
│  │ ┌───────────────────────────┐ │ │ 🟢 Owner Created             │   │
│  │ │ Branch    City    Revenue │ │ │ 🔵 Branch Created            │   │
│  │ ├───────────────────────────┤ │ │ 🟡 Subscription Assigned      │   │
│  │ │ Green A.  Mumbai  ₹17.4L  │ │ │ 🟢 Payment Logged            │   │
│  │ └───────────────────────────┘ │ │                               │   │
│  └───────────────────────────────┘ └───────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Owner Dashboard Layout

```text
┌────────────────────────────────────────────────────────────────────────┐
│  [Search...]                                                   🔔 [O]  │
├────────────────────────────────────────────────────────────────────────┤
│  Owner Dashboard  (Branch Operations)               [ Vashi Branch 🔽 ]│
│                                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │Today Bookings│ │Today Revenue │ │Occupancy Rate│ │Active Alerts │   │
│  │    14        │ │   ₹12,450    │ │    85%       │ │      2       │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Slots Timetable / Custom Slot Creator                           │   │
│  │  [Time]    [Court 1]        [Court 2]        [Court 3]          │   │
│  │  06:00 AM  [ Booked 🟢 ]    [ Available ⚪ ]  [ Available ⚪ ]  │   │
│  │  07:00 AM  [ Booked 🟢 ]    [ Booked 🟢 ]    [ Available ⚪ ]  │   │
│  │  08:00 AM  [ Available ⚪ ]  [ Available ⚪ ]  [ Maintenance 🛠️]  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌───────────────────────────────┐ ┌───────────────────────────────┐   │
│  │ POS Billing Interface         │ │ Inventory Alerts              │   │
│  │  Drinks   🏏 Bats   👟 Shoes  │ │ ⚠️ Cricket Balls: 3 left      │   │
│  │  [Add]     [Add]     [Add]    │ │ ⚠️ Tennis Grips: 1 left       │   │
│  └───────────────────────────────┘ └───────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 4. Customer Dashboard & Profile Layout

```text
┌────────────────────────────────────────────────────────────────────────┐
│  [Search...]                                                   🔔 [C]  │
├────────────────────────────────────────────────────────────────────────┤
│  My Profile                                                            │
│                                                                        │
│  ┌───────────────────────────────┐ ┌───────────────────────────────┐   │
│  │       [ Avatar: R ]           │ │ Personal Information          │   │
│  │        Rahul Kumar            │ │ Full Name:   [ Rahul Kumar ]  │   │
│  │      rahul@email.com          │ │ Email:       [rahul@email.com]│   │
│  │                               │ │ Phone:       [+91 9876543210] │   │
│  │      [Player]  [Verified]     │ │ City:        [ Mumbai      ]  │   │
│  │                               │ │                               │   │
│  │    ┌─────────────────────┐    │ │ [ Update Profile ]            │   │
│  │    │      24 Bookings    │    │ └───────────────────────────────┘   │
│  │    └─────────────────────┘    │ ┌───────────────────────────────┐   │
│  └───────────────────────────────┘ │ Sports Preferences            │   │
│                                    │ 🟢 Cricket  🟢 Football  [Add]│   │
│                                    └───────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 5. Core Sidebar Navigation Menu Schema

### Super Admin Sidebar
* `Dashboard` -> Global KPI cards, revenue charts, activity feed.
* `Branches` -> Multi-tenant branch setup and status.
* `Owners` -> Venue owners directory and account state toggles.
* `Subscriptions` -> SaaS subscription plan managers.
* `Analytics` -> Dynamic graphs for revenue, occupancy, and registrations.
* `Payment Logs` -> Global transaction log and commission payouts.
* `Settings` -> Global tenant configurations and API setups.

### Owner / Admin Sidebar
* `Dashboard` -> Venue operations panel, calendar highlights.
* `Sports` -> Setup active court categories and details.
* `Slots` -> Interactive grid timetable generator and prices config.
* `Bookings` -> Active field bookings lists.
* `POS Billing` -> Quick counter checkout system for slots and snacks.
* `Billing History` -> Invoice audit logs.
* `Tournaments` -> Cup creator and bracket viewer.
* `Teams` -> Team memberships list.
* `Wallet` -> Payout request board and records.
* `Reports` -> Booking occupancy, food revenue reports.
* `Inventory` -> Sports items, drinks, snacks logs.
* `Maintenance` -> Court cleaning, floodlight fixtures repairs scheduler.
* `Staff` -> Counter operator shift management.

### Staff Sidebar
* `Dashboard` -> Daily schedule and quick check-in widgets.
* `Bookings` -> Active slots checklist and scan logging.
* `Tournaments` -> Active bracket matches score entry.
* `Refunds` -> Cancelled booking refund approvals.
* `Maintenance` -> Work logs sheet.
* `Equipment` -> Rented equipment distribution check sheet.

### Customer Sidebar
* `Dashboard` -> Active wallet balance, upcoming slot alerts, shortcuts.
* `My Bookings` -> List of reserved fields (confirmed, past).
* `My Teams` -> Captain/Player team lists, member rosters.
* `My Matches` -> Upcoming match schedule and scores feed.
* `Tournaments` -> Registered tournaments brackets.
* `Wallet` -> Secure digital wallet transaction statement page.
* `Profile` -> Personal info form, sports tags preferences.

---

**End of File — `WireFrame.md`**