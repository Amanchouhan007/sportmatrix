FRONTEND TASK MASTER FILE
Sports & Gaming Business System
(React JS + Tailwind CSS)
🔴 PHASE 0 — PROJECT FOUNDATION
(DO THIS FIRST)
STEP 0.1 — Create React App
● Create project (Vite recommended)
● Install:
○ React Router
○ Axios
○ Tailwind CSS
○ Recharts
○ React Icons
○ Zustand or Redux Toolkit (optional)
STEP 0.2 — Setup Folder Architecture (Very Important)
src/
├── assets/
├── components/
│ ├── ui/
│ ├── tables/
│ ├── forms/
│ ├── charts/
├── layouts/
├── pages/
│ ├── website/
│ ├── superadmin/
│ ├── owner/
│ ├── staff/
│ ├── customer/
├── routes/
├── hooks/
├── services/
├── context/
├── utils/
├── App.jsx
Do NOT start building pages randomly.
🔴 PHASE 1 — GLOBAL UI SYSTEM
⚠ Build reusable system first.
STEP 1.1 — Layout Components
Create:
● MainLayout (Website)
● DashboardLayout
● Sidebar
● Header
● Mobile Drawer
● Footer
Sidebar must be dynamic (based on role).
STEP 1.2 — UI Components Library
Create reusable:
● Button component
● Input component
● Select component
● Modal component
● Card component
● Badge component
● Status indicator
● Table component
● Pagination component
● Loading spinner
● Toast notification
## Media Fixes
- [x] Replace Football image with a verified Unsplash stadium image

## Brand Identity Update
- [x] Rename "SGBOS" to "SportMatrix" across all layouts, auth, components, and pages
- [x] Update logo initials from "SG" to "SM"

## Pages Redesigns
- [x] **All Turfs**: Full width expansion, dark theme, premium sports styling and layout. Fixed broken images.
- [x] **All Turfs Layout**: Restructured layout to move filters to the top header space and make cards span full width across 4 columns.
⚠ Reusable design system banaye bina pages mat banaye.
STEP 1.3 — Tailwind Design Rules
Define:
● Primary color
● Secondary color
● Success / Danger / Warning
● Font sizes
● Spacing system
● Dark mode toggle
Make consistent theme file.
🔴 PHASE 2 — AUTHENTICATION FLOW
Build before dashboards.
STEP 2.1 — Login Page
Create:
● Email input
● Password input
● Login button
● Role-based redirect logic
STEP 2.2 — Protected Route Component
Create:
● PrivateRoute
● RoleGuard
Example logic:
If role !== "superadmin" → block superadmin route.
🔴 PHASE 3 — PUBLIC WEBSITE
(Customer Facing)
⚠ Build public website fully before dashboards.
STEP 3.1 — Website Pages Structure
Create:
1. Home Page
2. All Turfs Page
3. Turf Detail Page
4. Slot Booking Page
5. Tournament Listing
6. Tournament Detail
7. Membership Page
8. Player Marketplace Page
9. About Page
10. Contact Page
STEP 3.2 — Home Page Sections
● Hero Section
● Featured Sports
● Popular Turfs
● Upcoming Tournaments
● Testimonials
● Call to Action
STEP 3.3 — Turf Listing Page
Components:
● Filter sidebar
● Turf cards
● Pagination
STEP 3.4 — Turf Detail Page
Components:
● Image gallery
● Pricing table
● Available sports
● Slot calendar
● Book Now button
STEP 3.5 — Slot Booking UI
Create:
● Calendar view
● Time slot grid
● Dynamic price display
● Add-ons section
● Booking summary card
🔴 PHASE 4 — SUPER ADMIN
DASHBOARD
STEP 4.1 — SuperAdmin Layout
Create sidebar menu:
1. Dashboard
2. Branches
3. Owners
4. Subscription Plans
5. Commission Settings
6. Global Analytics
7. Users
8. Payment Logs
9. Disputes
10. System Settings
STEP 4.2 — SuperAdmin Pages
Dashboard Page
● Stats cards
● Revenue chart
● Active branches table
Branch Management
● Branch table
● Add branch modal
● Edit branch form
Subscription Page
● Plan cards
● Create plan modal
Commission Page
● Commission form
● Percentage setting
🔴 PHASE 5 — OWNER DASHBOARD
⚠ Most important UI.
STEP 5.1 — Owner Sidebar Structure
1. Dashboard
2. Sports Management
3. Slot Management
4. Booking Management
5. Tournament
6. Teams
7. Players
8. Player Bids
9. Wallet
10. Reports
11. Inventory
12. Maintenance
13. Staff
STEP 5.2 — Owner Dashboard Page
● Today revenue card
● Today bookings
● Upcoming matches
● Peak hour chart
STEP 5.3 — Sports Management Page
● Add sport form
● Pricing input
● Enable/disable toggle
● Sport list table
STEP 5.4 — Slot Management UI
● Time slot grid
● Create slot modal
● Block slot option
STEP 5.5 — Booking Management Page
● Booking table
● Status badge
● Filter by date
● Refund button
STEP 5.6 — Tournament UI
● Create tournament form
● Tournament table
● Bracket view UI
● Match update modal
STEP 5.7 — Teams & Players UI
Teams Page:
● Team list
● Ranking column
● Edit button
Players Page:
● Player list
● Skill level badge
● Stats modal
STEP 5.8 — Wallet Page
● Current balance card
● Transaction table
● Escrow table
STEP 5.9 — Reports Page
Use charts:
● Revenue bar chart
● Booking line chart
● Sport-wise pie chart
● Peak hour graph
STEP 5.10 — Inventory Page
● Inventory table
● Low stock alert badge
● Add item modal
STEP 5.11 — Maintenance Page
● Task list
● Assign staff dropdown
● Status update
🔴 PHASE 6 — STAFF DASHBOARD
Simplified UI based on role.
Manager:
● Booking page
● Tournament page
Cashier:
● POS page
● Refund page
Technician:
● Maintenance page
● Equipment page
Hide menus dynamically.
🔴 PHASE 7 — CUSTOMER DASHBOARD
Sidebar:
1. My Dashboard
2. My Bookings
3. My Teams
4. My Matches
5. Tournaments
6. Wallet
7. Profile
8. Hire Applications
Pages:
My Dashboard
● Upcoming booking
● Wallet balance
● Ranking
My Bookings
● Booking history
● Cancel option
My Teams
● Create team form
● Team list
My Matches
● Match history
● Stats
🔴 PHASE 8 — RESPONSIVE DESIGN
Test:
● Mobile sidebar collapse
● Tablet layout
● Desktop layout
Implement:
● Hamburger menu
● Drawer navigation
🔴 PHASE 9 — POLISHING
● Loading states
● Skeleton loaders
● Empty states
● Error pages
● 404 page
● Success animation
🔴 FINAL FRONTEND EXECUTION ORDER
1. Setup project
2. Build UI component system
3. Auth pages
4. Public website
5. SuperAdmin dashboard
6. Owner dashboard
7. Staff dashboard
8. Customer dashboard
9. Responsive fixes
10. Final polish