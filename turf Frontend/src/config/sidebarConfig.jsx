import { HiHome, HiOfficeBuilding, HiUsers, HiCreditCard, HiChartBar, HiCog, HiClipboardList, HiShieldCheck, HiExclamationCircle, HiCash } from 'react-icons/hi'
import { HiTrophy, HiCalendar, HiUserGroup, HiBolt, HiWallet, HiWrench, HiCube, HiDocumentText, HiUser, HiTicket } from 'react-icons/hi2'

const sidebarConfig = {
    superadmin: [
        { label: 'Dashboard', icon: <HiHome />, path: '/dashboard/super-admin' },
        { label: 'Branches', icon: <HiOfficeBuilding />, path: '/dashboard/super-admin/branches' },
        { label: 'Owners', icon: <HiUsers />, path: '/dashboard/super-admin/owners' },
        { label: 'Subscriptions', icon: <HiCreditCard />, path: '/dashboard/super-admin/subscriptions' },
        { label: 'Analytics', icon: <HiChartBar />, path: '/dashboard/super-admin/analytics' },
        { label: 'Payment Logs', icon: <HiClipboardList />, path: '/dashboard/super-admin/payments' },
        { label: 'Settings', icon: <HiCog />, path: '/dashboard/super-admin/settings' },
    ],
    owner: [
        { label: 'Dashboard', icon: <HiHome />, path: '/dashboard/owner' },
        { label: 'Sports', icon: <HiBolt />, path: '/dashboard/owner/sports' },
        { label: 'Slots', icon: <HiCalendar />, path: '/dashboard/owner/slots' },
        { label: 'Bookings', icon: <HiTicket />, path: '/dashboard/owner/bookings' },
        { label: 'POS Billing', icon: <HiCreditCard />, path: '/dashboard/owner/pos' },
        { label: 'Billing History', icon: <HiClipboardList />, path: '/dashboard/owner/billing-history' },
        { label: 'Tournaments', icon: <HiTrophy />, path: '/dashboard/owner/tournaments' },
        { label: 'Teams', icon: <HiUserGroup />, path: '/dashboard/owner/teams' },
        { label: 'Wallet', icon: <HiWallet />, path: '/dashboard/owner/wallet' },
        { label: 'Reports', icon: <HiChartBar />, path: '/dashboard/owner/reports' },
        { label: 'Inventory', icon: <HiCube />, path: '/dashboard/owner/inventory' },
        { label: 'Maintenance', icon: <HiWrench />, path: '/dashboard/owner/maintenance' },
        { label: 'Staff', icon: <HiUsers />, path: '/dashboard/owner/staff' },
    ],
    staff: [
        { label: 'Dashboard', icon: <HiHome />, path: '/dashboard/staff' },
        { label: 'Bookings', icon: <HiTicket />, path: '/dashboard/staff/bookings' },
        { label: 'Tournaments', icon: <HiTrophy />, path: '/dashboard/staff/tournaments' },
        { label: 'Refunds', icon: <HiCash />, path: '/dashboard/staff/refunds' },
        { label: 'Maintenance', icon: <HiWrench />, path: '/dashboard/staff/maintenance' },
        { label: 'Equipment', icon: <HiCube />, path: '/dashboard/staff/equipment' },
    ],
    customer: [
        { label: 'Dashboard', icon: <HiHome />, path: '/dashboard/customer' },
        { label: 'My Bookings', icon: <HiTicket />, path: '/dashboard/customer/bookings' },
        { label: 'My Teams', icon: <HiUserGroup />, path: '/dashboard/customer/teams' },
        { label: 'My Matches', icon: <HiTrophy />, path: '/dashboard/customer/matches' },
        { label: 'Tournaments', icon: <HiDocumentText />, path: '/dashboard/customer/tournaments' },
        { label: 'Wallet', icon: <HiWallet />, path: '/dashboard/customer/wallet' },
        { label: 'Profile', icon: <HiUser />, path: '/dashboard/customer/profile' },
    ],
}

export default sidebarConfig
