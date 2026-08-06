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
        { label: 'Dashboard', icon: <HiHome />, path: '/super-admin' },
        { label: 'Owners', icon: <HiUsers />, path: '/super-admin/owners' },
        { label: 'Subscriptions', icon: <HiCreditCard />, path: '/super-admin/subscriptions' },

        { isHeader: true, label: 'System Logs' },
        { label: 'Analytics Logs', icon: <HiChartBar />, path: '/super-admin/analytics' },
        { label: 'Payment Logs', icon: <HiClipboardList />, path: '/super-admin/payments' },
        { label: 'Settings', icon: <HiCog />, path: '/super-admin/settings' },
    ],
    owner: [
        { label: 'Dashboard', icon: <HiHome />, path: '/admin' },

        { isHeader: true, label: 'Marketing & Ads' },
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

        { isHeader: true, label: 'Tournaments' },
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

        { isHeader: true, label: 'Operations' },
        { label: 'Turf', icon: <HiBolt />, path: '/admin/sports' },
        { label: 'Slots', icon: <HiCalendar />, path: '/admin/slots' },
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

        { isHeader: true, label: 'Marketing' },
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

        { isHeader: true, label: 'Tournaments' },
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

        { isHeader: true, label: 'Staff Operations' },
        { label: 'Bookings', icon: <HiTicket />, path: '/staff/bookings' },
        { label: 'Refunds', icon: <HiCash />, path: '/staff/refunds' },
        { label: 'Maintenance', icon: <HiWrench />, path: '/staff/maintenance' },
        { label: 'Equipment', icon: <HiCube />, path: '/staff/equipment' },
    ],
    customer: [
        { label: 'Dashboard', icon: <HiHome />, path: '/customer' },
        { label: 'My Bookings', icon: <HiTicket />, path: '/customer/bookings' },
        { label: 'My Teams', icon: <HiUserGroup />, path: '/customer/teams' },
        { label: 'My Matches', icon: <HiTrophy />, path: '/customer/matches' },
        { label: 'Tournaments', icon: <HiDocumentText />, path: '/customer/tournaments' },
        { label: 'Wallet', icon: <HiWallet />, path: '/customer/wallet' },
        { label: 'Profile', icon: <HiUser />, path: '/customer/profile' },
    ],
}

export default sidebarConfig
