import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import PageLoader from './components/ui/PageLoader'
import ScrollToTop from './components/ui/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

// Layouts
import WebsiteLayout from './layouts/WebsiteLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Critical Path / Public Website (Loaded eagerly for instant home response)
import HomePage from './pages/website/HomePage'

// Lazy Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Lazy Public Website
const AllTurfsPage = lazy(() => import('./pages/website/AllTurfsPage'))
const GuestBookingPage = lazy(() => import('./pages/guest/GuestBookingPage'))
const TurfDetailPage = lazy(() => import('./pages/website/TurfDetailPage'))
const SlotBookingPage = lazy(() => import('./pages/website/SlotBookingPage'))
const TournamentListPage = lazy(() => import('./pages/website/TournamentListPage'))
const TournamentDetailPage = lazy(() => import('./pages/website/TournamentDetailPage'))
const MembershipPage = lazy(() => import('./pages/website/MembershipPage'))
const ContactPage = lazy(() => import('./pages/website/ContactPage'))
const PlayerLeaderboardPage = lazy(() => import('./pages/website/PlayerLeaderboardPage'))

// Lazy Super Admin
const SADashboard = lazy(() => import('./pages/superadmin/SADashboard'))
const SuperAdminGlobalCRMPage = lazy(() => import('./pages/superadmin/SuperAdminGlobalCRMPage'))
const BranchManagement = lazy(() => import('./pages/superadmin/BranchManagement'))
const OwnerManagement = lazy(() => import('./pages/superadmin/OwnerManagement'))
const SubscriptionPlans = lazy(() => import('./pages/superadmin/SubscriptionPlans'))
const GlobalAnalytics = lazy(() => import('./pages/superadmin/GlobalAnalytics'))
const UserManagement = lazy(() => import('./pages/superadmin/UserManagement'))
const PaymentLogs = lazy(() => import('./pages/superadmin/PaymentLogs'))
const Disputes = lazy(() => import('./pages/superadmin/Disputes'))
const SystemSettings = lazy(() => import('./pages/superadmin/SystemSettings'))

// Lazy Owner
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'))
const TurfLeadCRMPage = lazy(() => import('./pages/owner/TurfLeadCRMPage'))
const CustomerOffersFeed = lazy(() => import('./pages/customer/CustomerOffersFeed'))
const SportsManagement = lazy(() => import('./pages/owner/SportsManagement'))
const SlotManagement = lazy(() => import('./pages/owner/SlotManagement'))
const BookingManagement = lazy(() => import('./pages/owner/BookingManagement'))
const TeamsPlayers = lazy(() => import('./pages/owner/TeamsPlayers'))
const WalletPage = lazy(() => import('./pages/owner/WalletPage'))
const ReportsPage = lazy(() => import('./pages/owner/ReportsPage'))
const InventoryPage = lazy(() => import('./pages/owner/InventoryPage'))
const MaintenancePage = lazy(() => import('./pages/owner/MaintenancePage'))
const StaffManagement = lazy(() => import('./pages/owner/StaffManagement'))
const OwnerPOS = lazy(() => import('./pages/owner/OwnerPOS'))
const BillingHistory = lazy(() => import('./pages/owner/BillingHistory'))

// Lazy Staff
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'))
const StaffBookings = lazy(() => import('./pages/staff/StaffBookings'))
const StaffRefunds = lazy(() => import('./pages/staff/StaffRefunds'))
const StaffMaintenance = lazy(() => import('./pages/staff/StaffMaintenance'))
const StaffEquipment = lazy(() => import('./pages/staff/StaffEquipment'))

// Lazy Umpire & Referee Desk
const UmpireDashboard = lazy(() => import('./pages/umpire/UmpireDashboard'))

// Lazy Customer
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'))
const CustomerBookings = lazy(() => import('./pages/customer/CustomerBookings'))
const CustomerTeams = lazy(() => import('./pages/customer/CustomerTeams'))
const CustomerMatches = lazy(() => import('./pages/customer/CustomerMatches'))
const CustomerTournaments = lazy(() => import('./pages/customer/CustomerTournaments'))
const CustomerTournamentDetail = lazy(() => import('./pages/customer/CustomerTournamentDetail'))
const CustomerWallet = lazy(() => import('./pages/customer/CustomerWallet'))
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'))
const CustomerLeaderboard = lazy(() => import('./pages/customer/CustomerLeaderboard'))

// Lazy Advertising & Marketing Modules
const AllAdvertisements = lazy(() => import('./pages/advertising/AllAdvertisements'))
const CreateAdvertisement = lazy(() => import('./pages/advertising/CreateAdvertisement'))
const CommissionManagement = lazy(() => import('./pages/advertising/CommissionManagement'))
const AdAnalyticsDashboard = lazy(() => import('./pages/advertising/AdAnalyticsDashboard'))
const AdPaymentsPage = lazy(() => import('./pages/advertising/AdPaymentsPage'))
const OwnerMyAdvertisements = lazy(() => import('./pages/advertising/OwnerMyAdvertisements'))
const OwnerAdAnalytics = lazy(() => import('./pages/advertising/OwnerAdAnalytics'))
const DiscountOffersList = lazy(() => import('./pages/discounts/DiscountOffersList'))
const CreateDiscountOffer = lazy(() => import('./pages/discounts/CreateDiscountOffer'))

// Lazy Tournament Management System
const TournamentDashboard = lazy(() => import('./pages/tournaments/TournamentDashboard'))
const TournamentAllPage = lazy(() => import('./pages/tournaments/TournamentAllPage'))
const TournamentCreatePage = lazy(() => import('./pages/tournaments/TournamentCreatePage'))
const TournamentPendingPage = lazy(() => import('./pages/tournaments/TournamentPendingPage'))
const TournamentCategoriesPage = lazy(() => import('./pages/tournaments/TournamentCategoriesPage'))
const TournamentRegistrationsPage = lazy(() => import('./pages/tournaments/TournamentRegistrationsPage'))
const TournamentFixturesPage = lazy(() => import('./pages/tournaments/TournamentFixturesPage'))
const TournamentMatchesPage = lazy(() => import('./pages/tournaments/TournamentMatchesPage'))
const TournamentPaymentsPage = lazy(() => import('./pages/tournaments/TournamentPaymentsPage'))
const TournamentSponsorsPage = lazy(() => import('./pages/tournaments/TournamentSponsorsPage'))
const TournamentReportsPage = lazy(() => import('./pages/tournaments/TournamentReportsPage'))
const TournamentSettingsPage = lazy(() => import('./pages/tournaments/TournamentSettingsPage'))

const MobileControllerStandalonePage = lazy(() => import('./pages/mobile/MobileControllerStandalonePage'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastProvider>
          <Suspense fallback={<PageLoader text="Loading SportMatrix..." />}>
            <Routes>
              {/* Mobile Remote Controller Public Route */}
              <Route path="/mobile-controller/:sessionId" element={<MobileControllerStandalonePage />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Public Website */}
              <Route path="/" element={<WebsiteLayout><HomePage /></WebsiteLayout>} />
              <Route path="/turfs" element={<WebsiteLayout><AllTurfsPage /></WebsiteLayout>} />
              <Route path="/turfs/:id" element={<WebsiteLayout><TurfDetailPage /></WebsiteLayout>} />
              <Route path="/turf/:id" element={<WebsiteLayout><TurfDetailPage /></WebsiteLayout>} />
              <Route path="/booking/:id" element={<WebsiteLayout><SlotBookingPage /></WebsiteLayout>} />
              <Route path="/guest/book" element={<WebsiteLayout><GuestBookingPage /></WebsiteLayout>} />
              <Route path="/tournaments" element={<WebsiteLayout><TournamentListPage /></WebsiteLayout>} />
              <Route path="/tournaments/:id" element={<WebsiteLayout><TournamentDetailPage /></WebsiteLayout>} />
              <Route path="/membership" element={<WebsiteLayout><MembershipPage /></WebsiteLayout>} />
              <Route path="/leaderboard" element={<WebsiteLayout><PlayerLeaderboardPage /></WebsiteLayout>} />
              <Route path="/leaderboards" element={<Navigate to="/leaderboard" replace />} />
              <Route path="/contact" element={<WebsiteLayout><ContactPage /></WebsiteLayout>} />

              {/* Super Admin Dashboard */}
              <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><DashboardLayout role="superadmin" /></ProtectedRoute>}>
                <Route index element={<SADashboard />} />
                <Route path="branches" element={<BranchManagement />} />
                <Route path="owners" element={<OwnerManagement />} />
                <Route path="subscriptions" element={<SubscriptionPlans />} />
                <Route path="crm" element={<SuperAdminGlobalCRMPage />} />
                <Route path="ads" element={<AllAdvertisements />} />
                <Route path="ads/create" element={<CreateAdvertisement />} />
                <Route path="ads/commissions" element={<CommissionManagement />} />
                <Route path="ads/analytics" element={<AdAnalyticsDashboard />} />
                <Route path="ads/payments" element={<AdPaymentsPage />} />
                <Route path="analytics" element={<GlobalAnalytics />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="payments" element={<PaymentLogs />} />
                <Route path="disputes" element={<Disputes />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>

              {/* Admin Dashboard (/admin) */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['OWNER']}><DashboardLayout role="owner" /></ProtectedRoute>}>
                <Route index element={<OwnerDashboard />} />
                <Route path="branches" element={<BranchManagement />} />
                <Route path="crm" element={<TurfLeadCRMPage />} />
                <Route path="ads" element={<OwnerMyAdvertisements />} />
                <Route path="ads/all" element={<AllAdvertisements />} />
                <Route path="ads/create" element={<CreateAdvertisement />} />
                <Route path="ads/commissions" element={<CommissionManagement />} />
                <Route path="ads/analytics" element={<AdAnalyticsDashboard />} />
                <Route path="ads/payments" element={<AdPaymentsPage />} />
                <Route path="ads/owner-analytics" element={<OwnerAdAnalytics />} />
                <Route path="discount-offers" element={<DiscountOffersList />} />
                <Route path="discount-offers/create" element={<CreateDiscountOffer />} />
                <Route path="sports" element={<SportsManagement />} />
                <Route path="calendar" element={<SlotManagement />} />
                <Route path="slots" element={<SlotManagement />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="pos" element={<OwnerPOS />} />
                <Route path="billing-history" element={<BillingHistory />} />

                {/* Tournament Management System Sub-Routes */}
                <Route path="tournaments" element={<TournamentAllPage role="owner" />} />
                <Route path="tournaments/dashboard" element={<TournamentDashboard role="owner" />} />
                <Route path="tournaments/all" element={<TournamentAllPage role="owner" />} />
                <Route path="tournaments/create" element={<TournamentCreatePage role="owner" />} />
                <Route path="tournaments/pending" element={<TournamentPendingPage role="owner" />} />
                <Route path="tournaments/categories" element={<TournamentCategoriesPage />} />
                <Route path="tournaments/registrations" element={<TournamentRegistrationsPage />} />
                <Route path="tournaments/fixtures" element={<TournamentFixturesPage />} />
                <Route path="tournaments/matches" element={<TournamentMatchesPage />} />
                <Route path="tournaments/payments" element={<TournamentPaymentsPage />} />
                <Route path="tournaments/sponsors" element={<TournamentSponsorsPage role="owner" />} />
                <Route path="tournaments/reports" element={<TournamentReportsPage />} />
                <Route path="tournaments/settings" element={<TournamentSettingsPage />} />

                <Route path="teams" element={<TeamsPlayers />} />
                <Route path="players" element={<TeamsPlayers />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="maintenance" element={<MaintenancePage />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>

              {/* Staff Dashboard (/staff) */}
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['STAFF']}><DashboardLayout role="staff" /></ProtectedRoute>}>
                <Route index element={<StaffDashboard />} />
                <Route path="ads" element={<OwnerMyAdvertisements />} />
                <Route path="ads/create" element={<CreateAdvertisement />} />
                <Route path="ads/analytics" element={<OwnerAdAnalytics />} />
                <Route path="bookings" element={<StaffBookings />} />

                {/* Staff Tournament Management Sub-Routes */}
                <Route path="tournaments" element={<TournamentAllPage role="staff" />} />
                <Route path="tournaments/dashboard" element={<TournamentDashboard role="staff" />} />
                <Route path="tournaments/all" element={<TournamentAllPage role="staff" />} />
                <Route path="tournaments/create" element={<Navigate to="/staff/tournaments/dashboard" replace />} />
                <Route path="tournaments/pending" element={<TournamentPendingPage role="staff" />} />
                <Route path="tournaments/categories" element={<TournamentCategoriesPage />} />
                <Route path="tournaments/registrations" element={<TournamentRegistrationsPage />} />
                <Route path="tournaments/fixtures" element={<TournamentFixturesPage />} />
                <Route path="tournaments/matches" element={<TournamentMatchesPage />} />
                <Route path="tournaments/payments" element={<TournamentPaymentsPage />} />
                <Route path="tournaments/sponsors" element={<TournamentSponsorsPage role="staff" />} />
                <Route path="tournaments/reports" element={<TournamentReportsPage />} />
                <Route path="tournaments/settings" element={<TournamentSettingsPage />} />

                <Route path="refunds" element={<StaffRefunds />} />
                <Route path="maintenance" element={<StaffMaintenance />} />
                <Route path="equipment" element={<StaffEquipment />} />
              </Route>

              {/* Customer Dashboard */}
              <Route path="/customer" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><DashboardLayout role="customer" /></ProtectedRoute>}>
                <Route index element={<CustomerDashboard />} />
                <Route path="offers" element={<CustomerOffersFeed />} />
                <Route path="bookings" element={<CustomerBookings />} />
                <Route path="teams" element={<CustomerTeams />} />
                <Route path="matches" element={<CustomerMatches />} />
                <Route path="tournaments" element={<CustomerTournaments />} />
                <Route path="tournaments/:id" element={<CustomerTournamentDetail />} />
                <Route path="leaderboard" element={<CustomerLeaderboard />} />
                <Route path="wallet" element={<CustomerWallet />} />
                <Route path="profile" element={<CustomerProfile />} />
              </Route>

              {/* Official Umpire & Live Match Referee Portal */}
              <Route path="/umpire" element={<ProtectedRoute allowedRoles={['UMPIRE', 'SUPER_ADMIN', 'OWNER', 'STAFF']}><UmpireDashboard /></ProtectedRoute>} />
              <Route path="/umpire/*" element={<ProtectedRoute allowedRoles={['UMPIRE', 'SUPER_ADMIN', 'OWNER', 'STAFF']}><UmpireDashboard /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}
