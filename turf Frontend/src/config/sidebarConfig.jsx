import {
    HiHome, HiOfficeBuilding, HiUsers, HiCreditCard, HiChartBar, HiCog, HiClipboardList,
    HiShieldCheck, HiExclamationCircle, HiCash, HiSpeakerphone, HiCurrencyDollar,
    HiTag, HiCheckCircle, HiStar, HiAdjustments, HiViewGrid
} from 'react-icons/hi'
import {
    HiTrophy, HiCalendar, HiUserGroup, HiBolt, HiWallet, HiWrench, HiCube,
    HiDocumentText, HiUser, HiTicket, HiMegaphone, HiSparkles, HiPlay
} from 'react-icons/hi2'

const sidebarConfig = {
    superadmin: [
        { isHeader: true, label: 'DASHBOARD' },
        { label: 'Dashboard', icon: <HiHome />, path: '/super-admin' },
        { isHeader: true, label: 'MANAGEMENT' },
        { label: 'Owners', icon: <HiUsers />, path: '/super-admin/owners' },
        { label: 'Subscriptions', icon: <HiCreditCard />, path: '/super-admin/subscriptions' },
        { label: 'Global Lead CRM', icon: <HiUserGroup />, path: '/super-admin/crm' },
        { isHeader: true, label: 'REPORTS' },
        { label: 'Analytics Logs', icon: <HiChartBar />, path: '/super-admin/analytics' },
        { label: 'Payment Logs', icon: <HiClipboardList />, path: '/super-admin/payments' },
        { isHeader: true, label: 'SETTINGS' },
        { label: 'Settings', icon: <HiCog />, path: '/super-admin/settings' },
    ],
    owner: [
        { label: 'Dashboard', icon: <HiHome />, path: '/admin' },
        { label: 'Lead CRM & Broadcast', icon: <HiUserGroup />, path: '/admin/crm' },
        {
            isCollapsible: true,
            label: 'Advertising Management',
            icon: <HiSpeakerphone />,
            pathPrefix: '/admin/ads',
            children: [
                { label: 'All Advertisements', icon: <HiSpeakerphone />, path: '/admin/ads' },
                { label: 'Discount Offers', icon: <HiTag />, path: '/admin/discount-offers' },
                { label: 'Commission Management', icon: <HiCurrencyDollar />, path: '/admin/ads/commissions' },
                { label: 'Analytics', icon: <HiChartBar />, path: '/admin/ads/analytics' },
                { label: 'Payments', icon: <HiCreditCard />, path: '/admin/ads/payments' },
            ]
        },
        {
            isCollapsible: true,
            label: 'Tournament Management',
            icon: <HiTrophy />,
            pathPrefix: '/admin/tournaments',
            children: [
                { label: 'Dashboard', icon: <HiChartBar />, path: '/admin/tournaments/dashboard' },
                { label: 'All Tournaments', icon: <HiTrophy />, path: '/admin/tournaments/all' },
                { label: 'Team Registrations', icon: <HiUserGroup />, path: '/admin/tournaments/registrations' },
                { label: 'Fixtures', icon: <HiViewGrid />, path: '/admin/tournaments/fixtures' },
                { label: 'Matches', icon: <HiPlay />, path: '/admin/tournaments/matches' },
                { label: 'Payments', icon: <HiCreditCard />, path: '/admin/tournaments/payments' },
                { label: 'Sponsors', icon: <HiStar />, path: '/admin/tournaments/sponsors' },
                { label: 'Reports', icon: <HiClipboardList />, path: '/admin/tournaments/reports' },
                { label: 'Settings', icon: <HiAdjustments />, path: '/admin/tournaments/settings' },
            ]
        },
        { label: 'Turf & Rates Setup', icon: <HiBolt />, path: '/admin/sports' },
        { label: 'Turf Calendar', icon: <HiCalendar />, path: '/admin/calendar' },
        { label: 'Bookings', icon: <HiTicket />, path: '/admin/bookings' },
        { label: 'POS Billing', icon: <HiCreditCard />, path: '/admin/pos' },
        { label: 'Billing History', icon: <HiClipboardList />, path: '/admin/billing-history' },
        { label: 'Teams', icon: <HiUserGroup />, path: '/admin/teams' },
        { label: 'Wallet', icon: <HiWallet />, path: '/admin/wallet' },
        { label: 'Reports', icon: <HiChartBar />, path: '/admin/reports' },
        { label: 'Inventory', icon: <HiCube />, path: '/admin/inventory' },
        { label: 'Maintenance', icon: <HiWrench />, path: '/admin/maintenance' },
        { label: 'Staff', icon: <HiUsers />, path: '/admin/staff' },
    ],
    staff: [
        { label: 'Dashboard', icon: <HiHome />, path: '/staff' },
        {
            isCollapsible: true,
            label: 'Advertising Management',
            icon: <HiMegaphone />,
            pathPrefix: '/staff/ads',
            children: [
                { label: 'My Advertisements', icon: <HiMegaphone />, path: '/staff/ads' },
                { label: 'Advertisement Analytics', icon: <HiChartBar />, path: '/staff/ads/analytics' },
            ]
        },
        {
            isCollapsible: true,
            label: 'Tournament Management',
            icon: <HiTrophy />,
            pathPrefix: '/staff/tournaments',
            children: [
                { label: 'Dashboard', icon: <HiChartBar />, path: '/staff/tournaments/dashboard' },
                { label: 'All Tournaments', icon: <HiTrophy />, path: '/staff/tournaments/all' },
                { label: 'Team Registrations', icon: <HiUserGroup />, path: '/staff/tournaments/registrations' },
                { label: 'Fixtures', icon: <HiViewGrid />, path: '/staff/tournaments/fixtures' },
                { label: 'Matches', icon: <HiPlay />, path: '/staff/tournaments/matches' },
            ]
        },
        { label: 'Bookings', icon: <HiTicket />, path: '/staff/bookings' },
        { label: 'Refunds', icon: <HiCash />, path: '/staff/refunds' },
        { label: 'Maintenance', icon: <HiWrench />, path: '/staff/maintenance' },
        { label: 'Equipment', icon: <HiCube />, path: '/staff/equipment' },
    ],
    customer: [
        { label: 'Dashboard', icon: <HiHome />, path: '/customer' },
        { label: 'Offers & Earning Alerts', icon: <HiSparkles />, path: '/customer/offers' },
        { label: 'My Bookings', icon: <HiTicket />, path: '/customer/bookings' },
        { label: 'My Teams', icon: <HiUserGroup />, path: '/customer/teams' },
        { label: 'My Matches', icon: <HiTrophy />, path: '/customer/matches' },
        { label: 'Tournaments', icon: <HiDocumentText />, path: '/customer/tournaments' },
        { label: 'Wallet', icon: <HiWallet />, path: '/customer/wallet' },
        { label: 'Profile', icon: <HiUser />, path: '/customer/profile' },
    ],
}

export default sidebarConfig
