import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'

// Layouts
import WebsiteLayout from './layouts/WebsiteLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Auth
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

// Public Website
import HomePage from './pages/website/HomePage'
import AllTurfsPage from './pages/website/AllTurfsPage'
import TurfDetailPage from './pages/website/TurfDetailPage'
import SlotBookingPage from './pages/website/SlotBookingPage'
import TournamentListPage from './pages/website/TournamentListPage'
import TournamentDetailPage from './pages/website/TournamentDetailPage'
import MembershipPage from './pages/website/MembershipPage'
import ContactPage from './pages/website/ContactPage'

// Super Admin
import SADashboard from './pages/superadmin/SADashboard'
import BranchManagement from './pages/superadmin/BranchManagement'
import OwnerManagement from './pages/superadmin/OwnerManagement'
import SubscriptionPlans from './pages/superadmin/SubscriptionPlans'
import GlobalAnalytics from './pages/superadmin/GlobalAnalytics'
import UserManagement from './pages/superadmin/UserManagement'
import PaymentLogs from './pages/superadmin/PaymentLogs'
import Disputes from './pages/superadmin/Disputes'
import SystemSettings from './pages/superadmin/SystemSettings'

// Owner
import OwnerDashboard from './pages/owner/OwnerDashboard'
import SportsManagement from './pages/owner/SportsManagement'
import SlotManagement from './pages/owner/SlotManagement'
import BookingManagement from './pages/owner/BookingManagement'
import TeamsPlayers from './pages/owner/TeamsPlayers';
import WalletPage from './pages/owner/WalletPage'
import ReportsPage from './pages/owner/ReportsPage'
import InventoryPage from './pages/owner/InventoryPage'
import MaintenancePage from './pages/owner/MaintenancePage'
import StaffManagement from './pages/owner/StaffManagement'
import OwnerPOS from './pages/owner/OwnerPOS'
import BillingHistory from './pages/owner/BillingHistory';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffBookings from './pages/staff/StaffBookings'
import StaffRefunds from './pages/staff/StaffRefunds'
import StaffMaintenance from './pages/staff/StaffMaintenance'
import StaffEquipment from './pages/staff/StaffEquipment'

// Customer
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerBookings from './pages/customer/CustomerBookings'
import CustomerTeams from './pages/customer/CustomerTeams'
import CustomerMatches from './pages/customer/CustomerMatches'
import CustomerTournaments from './pages/customer/CustomerTournaments'
import CustomerTournamentDetail from './pages/customer/CustomerTournamentDetail'
import CustomerWallet from './pages/customer/CustomerWallet'
import CustomerProfile from './pages/customer/CustomerProfile'

// Advertising & Marketing Modules
import AllAdvertisements from './pages/advertising/AllAdvertisements'
import CreateAdvertisement from './pages/advertising/CreateAdvertisement'
import CommissionManagement from './pages/advertising/CommissionManagement'
import AdAnalyticsDashboard from './pages/advertising/AdAnalyticsDashboard'
import AdPaymentsPage from './pages/advertising/AdPaymentsPage'
import OwnerMyAdvertisements from './pages/advertising/OwnerMyAdvertisements'
import OwnerAdAnalytics from './pages/advertising/OwnerAdAnalytics'
import DiscountOffersList from './pages/discounts/DiscountOffersList'
import CreateDiscountOffer from './pages/discounts/CreateDiscountOffer'

// Tournament Management System Module Pages
import TournamentDashboard from './pages/tournaments/TournamentDashboard'
import TournamentAllPage from './pages/tournaments/TournamentAllPage'
import TournamentCreatePage from './pages/tournaments/TournamentCreatePage'
import TournamentPendingPage from './pages/tournaments/TournamentPendingPage'
import TournamentCategoriesPage from './pages/tournaments/TournamentCategoriesPage'
import TournamentRegistrationsPage from './pages/tournaments/TournamentRegistrationsPage'
import TournamentFixturesPage from './pages/tournaments/TournamentFixturesPage'
import TournamentMatchesPage from './pages/tournaments/TournamentMatchesPage'
import TournamentPaymentsPage from './pages/tournaments/TournamentPaymentsPage'
import TournamentSponsorsPage from './pages/tournaments/TournamentSponsorsPage'
import TournamentReportsPage from './pages/tournaments/TournamentReportsPage'
import TournamentSettingsPage from './pages/tournaments/TournamentSettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Public Website */}
            <Route path="/" element={<WebsiteLayout><HomePage /></WebsiteLayout>} />
            <Route path="/turfs" element={<WebsiteLayout><AllTurfsPage /></WebsiteLayout>} />
            <Route path="/turfs/:id" element={<WebsiteLayout><TurfDetailPage /></WebsiteLayout>} />
            <Route path="/booking/:id" element={<WebsiteLayout><SlotBookingPage /></WebsiteLayout>} />
            <Route path="/tournaments" element={<WebsiteLayout><TournamentListPage /></WebsiteLayout>} />
            <Route path="/tournaments/:id" element={<WebsiteLayout><TournamentDetailPage /></WebsiteLayout>} />
            <Route path="/membership" element={<WebsiteLayout><MembershipPage /></WebsiteLayout>} />
            <Route path="/contact" element={<WebsiteLayout><ContactPage /></WebsiteLayout>} />

            {/* Super Admin Dashboard */}
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><DashboardLayout role="superadmin" /></ProtectedRoute>}>
              <Route index element={<SADashboard />} />
              <Route path="branches" element={<BranchManagement />} />
              <Route path="owners" element={<OwnerManagement />} />
              <Route path="subscriptions" element={<SubscriptionPlans />} />
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
              <Route path="tournaments/create" element={<TournamentCreatePage role="staff" />} />
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
              <Route path="bookings" element={<CustomerBookings />} />
              <Route path="teams" element={<CustomerTeams />} />
              <Route path="matches" element={<CustomerMatches />} />
              <Route path="tournaments" element={<CustomerTournaments />} />
              <Route path="tournaments/:id" element={<CustomerTournamentDetail />} />
              <Route path="wallet" element={<CustomerWallet />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}
