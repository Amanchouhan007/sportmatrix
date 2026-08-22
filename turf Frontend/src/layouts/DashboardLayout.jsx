import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
    HiMenu, 
    HiX, 
    HiLogout, 
    HiBell, 
    HiSearch, 
    HiChevronDown, 
    HiChevronLeft,
    HiChevronRight,
    HiPlus, 
    HiUser,
    HiLightningBolt,
    HiCog
} from 'react-icons/hi'
import {
    HiTrophy,
    HiTicket,
    HiUserGroup,
    HiDocumentText
} from 'react-icons/hi2'
import sidebarConfig from '../config/sidebarConfig'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

const roleLabels = { superadmin: 'Super Admin', owner: 'ADMIN', staff: 'Staff', customer: 'Customer' }

const profileRouteMap = {
    superadmin: '/super-admin/settings',
    owner: '/admin/settings',
    staff: '/staff',
    customer: '/customer/profile'
}

const roleNotifications = {
    superadmin: [],
    owner: [],
    staff: [],
    customer: []
}

export default function DashboardLayout({ role = 'owner' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [quickActionOpen, setQuickActionOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [selectedNotifData, setSelectedNotifData] = useState(null)
    const [receiptModalData, setReceiptModalData] = useState(null)
    const [openMenus, setOpenMenus] = useState({})

    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()
    const menu = sidebarConfig[role] || []

    // Load dynamic real-time notifications from website bookings, owners & corporate proposals
    const loadLiveNotifications = () => {
        try {
            const liveNotifs = []

            // 1. Turf Slot Bookings
            const rawCust = localStorage.getItem('customer_bookings')
            const rawGuest = localStorage.getItem('guest_bookings')
            const cList = rawCust ? JSON.parse(rawCust) : []
            const gList = rawGuest ? JSON.parse(rawGuest) : []
            const allBookings = [...(Array.isArray(cList) ? cList : []), ...(Array.isArray(gList) ? gList : [])]

            if (allBookings.length > 0) {
                allBookings.slice(0, 5).forEach((b, idx) => {
                    const bAmt = Number(b.amount || b.rent || 1200)
                    liveNotifs.push({
                        id: `book-${b.id || idx}`,
                        title: '⚡ Real Slot Booking',
                        desc: `${b.venue || b.turfName || 'Indore Turf Complex'} booked by ${b.userName || b.customerName || b.name || 'Valued Player'} (₹${bAmt.toLocaleString('en-IN')})`,
                        time: 'Recently',
                        unread: true,
                        path: role === 'superadmin' ? '/super-admin/payments' : role === 'owner' ? '/admin/bookings' : '/customer/bookings',
                        dataDetails: {
                            category: 'Real Turf Booking',
                            bookingId: b.id || b.bookingId || `BK-${idx + 1}`,
                            customerName: b.userName || b.customerName || b.name || 'Valued Player',
                            customerPhone: b.userPhone || b.phone || '+91 98765 43210',
                            turfVenue: b.venue || b.turfName || 'Indore Turf Complex',
                            timeSlot: b.time || '06:00 PM - 07:00 PM',
                            paymentStatus: 'PAID VIA UPI 🟢',
                            amount: `₹${bAmt.toLocaleString('en-IN')}`,
                            date: b.date || new Date().toISOString().split('T')[0]
                        }
                    })
                })
            }

            // 2. Corporate Proposals
            const rawCorp = localStorage.getItem('corporate_proposals_data')
            if (rawCorp) {
                const corpList = JSON.parse(rawCorp)
                if (Array.isArray(corpList)) {
                    corpList.slice(0, 3).forEach((c, idx) => {
                        liveNotifs.push({
                            id: `corp-${c.id || idx}`,
                            title: '🏢 Corporate Proposal Request',
                            desc: `${c.companyName || 'Corporate Client'} requested proposal for ${c.eventType || 'Tournament'} (${c.budget || 'Custom Budget'})`,
                            time: 'Recently',
                            unread: true,
                            path: '/super-admin/crm',
                            dataDetails: {
                                category: 'Corporate Lead',
                                refNo: c.id || `CORP-${idx + 1}`,
                                ownerName: c.contactName || c.companyName || 'Corporate Client',
                                businessName: c.companyName || 'Corporate Client',
                                email: c.email || 'corporate@client.com',
                                mobile: c.phone || '+91 98765 88888',
                                status: 'NEW LEAD 🟢',
                                date: new Date().toISOString().split('T')[0]
                            }
                        })
                    })
                }
            }

            // 3. Real Registered Owners
            const rawBranches = localStorage.getItem('sa_branches_data')
            if (rawBranches) {
                const bList = JSON.parse(rawBranches)
                if (Array.isArray(bList) && bList.length > 0) {
                    bList.slice(0, 2).forEach((br, idx) => {
                        liveNotifs.push({
                            id: `branch-${br.id || idx}`,
                            title: '🏢 Active Branch Verified',
                            desc: `${br.name || 'Turf Branch'} managed by ${br.ownerName || 'Kiaan Technology'} (${br.plan || 'Starter Plan'})`,
                            time: 'Active',
                            unread: false,
                            path: '/super-admin/branches',
                            dataDetails: {
                                category: 'Branch Registration',
                                refNo: br.code || `BR-${idx + 100}`,
                                ownerName: br.ownerName || 'Kiaan Technology',
                                businessName: br.name || 'Indore Turf Complex',
                                email: br.email || 'owner@turf.com',
                                mobile: br.phone || '+91 98765 12345',
                                plan: br.plan || 'Starter Plan',
                                status: 'ACTIVE & VERIFIED',
                                date: br.createdDate || '20 Aug 2026'
                            }
                        })
                    })
                }
            }

            setNotifications(liveNotifs)
        } catch (e) {
            setNotifications([])
        }
    }

    useEffect(() => {
        loadLiveNotifications()
        window.addEventListener('storage', loadLiveNotifications)
        return () => window.removeEventListener('storage', loadLiveNotifications)
    }, [role])

    // Auto-expand parent menu if current location matches any child item
    useEffect(() => {
        menu.forEach(item => {
            if (item.isCollapsible && item.children) {
                const isActive = item.children.some(child => 
                    location.pathname === child.path || 
                    (child.path !== '/admin/ads' && child.path !== '/staff/ads' && location.pathname.startsWith(child.path)) ||
                    location.pathname.startsWith(item.pathPrefix)
                )
                if (isActive) {
                    setOpenMenus(prev => ({ ...prev, [item.label]: true }))
                }
            }
        })
    }, [location.pathname, menu])

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }))
    }

    const profileRouteMap = {
        superadmin: '/super-admin/settings',
        owner: '/admin/settings',
        staff: '/staff',
        customer: '/customer/profile',
    }

    // Close dropdowns on click away
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.profile-dropdown-container')) {
                setDropdownOpen(false)
            }
            if (!event.target.closest('.notif-dropdown-container')) {
                setNotifOpen(false)
            }
            if (!event.target.closest('.quick-action-container')) {
                setQuickActionOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const hasUnread = notifications.some(n => n.unread)

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    }

    const basePath = role === 'staff' ? '/staff' : role === 'superadmin' ? '/super-admin' : role === 'customer' ? '/customer' : '/admin'

    const quickActionItems = role === 'customer' ? [
        { label: 'Book Turf', icon: <HiTicket className="w-4 h-4 text-emerald-600" />, path: '/turfs' },
        { label: 'Browse Tournaments', icon: <HiTrophy className="w-4 h-4 text-amber-500" />, path: '/tournaments' },
        { label: 'My Bookings', icon: <HiDocumentText className="w-4 h-4 text-indigo-500" />, path: '/customer/bookings' },
    ] : role === 'superadmin' ? [
        { label: 'Add Owner', icon: <HiUser className="w-4 h-4 text-emerald-600" />, path: '/super-admin/owners' },
        { label: 'View Subscriptions', icon: <HiLightningBolt className="w-4 h-4 text-[#10B981]" />, path: '/super-admin/subscriptions' },
        { label: 'Ad Campaigns', icon: <HiTrophy className="w-4 h-4 text-amber-500" />, path: '/super-admin/ads' },
    ] : [
        { label: 'Add Booking', icon: <HiTicket className="w-4 h-4 text-emerald-600" />, path: role === 'staff' ? '/staff/bookings' : '/admin/pos' },
        { label: 'Add Turf', icon: <HiLightningBolt className="w-4 h-4 text-[#10B981]" />, path: role === 'staff' ? '/staff' : '/admin/sports' },
        { label: 'Add Tournament', icon: <HiTrophy className="w-4 h-4 text-amber-500" />, path: `${basePath}/tournaments/all` },
        { label: 'Add Team', icon: <HiUserGroup className="w-4 h-4 text-blue-500" />, path: role === 'staff' ? '/staff/tournaments/registrations' : '/admin/teams' },
        { label: 'Create Invoice', icon: <HiDocumentText className="w-4 h-4 text-indigo-500" />, path: role === 'staff' ? '/staff/bookings' : '/admin/pos' },
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 relative selection:bg-[#10B981]/20 overflow-x-hidden">
            {/* Subtle Ambient Radial Glow */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-green-500/4 rounded-full blur-[160px] pointer-events-none -z-10" />

            {/* Sidebar Component */}
            <aside 
                className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200/80 flex flex-col z-50 transition-all duration-300 shadow-[4px_0_20px_rgba(0,0,0,0.02)] ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isCollapsed ? 'lg:w-[78px]' : 'lg:w-[270px]'} w-[270px]`}
            >
                {/* Brand Header */}
                <div className="p-4 h-[72px] flex items-center justify-between border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-500/20 shrink-0">
                            SM
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-slate-900 text-base tracking-tight uppercase italic leading-none truncate">
                                    SPORTAMAX<span className="text-[#10B981]">.</span>
                                </span>
                                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mt-1">
                                    {roleLabels[role] || 'ADMIN'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Collapse toggle button on desktop */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)} 
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <HiChevronRight className="w-4 h-4" /> : <HiChevronLeft className="w-4 h-4" />}
                    </button>

                    {/* Mobile close button */}
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer">
                        <HiX className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" style={{ scrollbarWidth: 'thin' }}>
                    {menu.map((item, idx) => {
                        if (item.isHeader) {
                            if (isCollapsed) return <div key={idx} className="my-2 border-t border-slate-100" />
                            return (
                                <div key={idx} className="pt-4 pb-1.5 px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {item.label}
                                </div>
                            )
                        }

                        if (item.isCollapsible) {
                            const isOpen = !!openMenus[item.label]
                            const isParentActive = item.children?.some(child => 
                                location.pathname === child.path || 
                                (child.path !== '/admin/ads' && child.path !== '/staff/ads' && location.pathname.startsWith(child.path)) ||
                                location.pathname.startsWith(item.pathPrefix)
                            )

                            return (
                                <div key={item.label} className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => toggleMenu(item.label)}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                            isParentActive
                                                ? 'bg-emerald-50 text-[#10B981] border-l-4 border-[#10B981] font-extrabold'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <span className={`text-base shrink-0 ${isParentActive ? 'text-[#10B981]' : 'text-slate-500'}`}>{item.icon}</span>
                                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <HiChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
                                        )}
                                    </button>

                                    {!isCollapsed && (
                                        <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="pl-3 border-l-2 border-emerald-100 ml-4 my-1 space-y-1">
                                                {item.children.map((child) => (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        end={child.path === '/admin/ads' || child.path === '/staff/ads'}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                            isActive
                                                                ? 'bg-emerald-50 text-[#10B981] font-black'
                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        <span className="text-sm shrink-0">{child.icon}</span>
                                                        <span className="truncate">{child.label}</span>
                                                    </NavLink>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={isCollapsed ? item.label : undefined}
                                end={item.path === '/super-admin' || item.path === '/admin' || item.path === '/staff' || item.path === '/customer'}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-emerald-50 text-[#10B981] border-l-4 border-[#10B981] font-extrabold shadow-2xs' 
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <span className={`text-base shrink-0 ${location.pathname === item.path ? 'text-[#10B981]' : 'text-slate-500'}`}>{item.icon}</span>
                                {!isCollapsed && <span className="truncate ml-3">{item.label}</span>}
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
                    <button 
                        onClick={() => { logout(); navigate('/'); }} 
                        title={isCollapsed ? "Logout" : undefined}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3.5'} py-2.5 w-full rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer`}
                    >
                        <HiLogout className="text-base shrink-0" />
                        {!isCollapsed && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main Content Layout */}
            <div className={`flex-1 flex flex-col min-w-0 ${isCollapsed ? 'lg:ml-[78px]' : 'lg:ml-[270px]'} transition-all duration-300`}>
                {/* Top Header */}
                <header className={`fixed top-0 right-0 z-30 h-[72px] bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm ${isCollapsed ? 'lg:left-[78px]' : 'lg:left-[270px]'} left-0 transition-all duration-300`}>
                    {/* Left: Mobile Toggle & Global Search */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer text-slate-700">
                            <HiMenu className="w-5 h-5" />
                        </button>

                        <div className="relative hidden md:block w-72 lg:w-96">
                            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                placeholder="Search turf, owner, booking..." 
                                className="w-full pl-10 pr-12 py-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs pointer-events-none">
                                ⌘ K
                            </span>
                        </div>
                    </div>

                    {/* Right: Quick Action, Notifications & User Avatar */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Quick Action Button */}
                        <div className="relative quick-action-container">
                            <button 
                                onClick={() => setQuickActionOpen(!quickActionOpen)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs shadow-sm hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border border-emerald-400/30"
                            >
                                <HiPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Quick Action</span>
                                <HiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${quickActionOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Quick Action Dropdown Popover */}
                            {quickActionOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Quick Actions
                                    </div>
                                    <div className="space-y-0.5">
                                        {quickActionItems.map(item => (
                                            <button
                                                key={item.label}
                                                onClick={() => {
                                                    setQuickActionOpen(false)
                                                    navigate(item.path)
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notifications Bell Dropdown */}
                        <div className="relative notif-dropdown-container">
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 cursor-pointer transition-colors border border-slate-200/60"
                                aria-label="Notifications"
                            >
                                <HiBell className="w-4.5 h-4.5" />
                                {hasUnread && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/90 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-in fade-in duration-150">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Notifications</h3>
                                            {hasUnread && (
                                                <span className="px-2 py-0.5 bg-emerald-50 text-[#10B981] text-[10px] font-black rounded-full border border-emerald-200/60">
                                                    {notifications.filter(n => n.unread).length} new
                                                </span>
                                            )}
                                        </div>
                                        {hasUnread && (
                                            <button
                                                onClick={markAllRead}
                                                className="text-[11px] font-bold text-[#10B981] hover:underline cursor-pointer"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100" style={{ scrollbarWidth: 'thin' }}>
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                                <div
                                                    key={n.id}
                                                    onClick={() => {
                                                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item))
                                                        setNotifOpen(false)
                                                        setSelectedNotifData(n)
                                                    }}
                                                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${n.unread ? 'bg-emerald-50/30' : ''}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-[#10B981]' : 'bg-transparent'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.desc}</p>
                                                        <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">{n.time}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="p-6 text-center text-xs text-slate-400 font-medium">No notifications</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Settings Icon Button */}
                        <button
                            onClick={() => navigate(profileRouteMap[role] || '/admin/settings')}
                            className="p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 cursor-pointer transition-colors border border-slate-200/60"
                            title="System & Profile Settings"
                            aria-label="Settings"
                        >
                            <HiCog className="w-4.5 h-4.5 text-slate-700 hover:text-emerald-600" />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative profile-dropdown-container">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white font-black text-xs flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs border border-emerald-400/40 select-none"
                            >
                                {(user?.fullName || user?.email || role).substring(0, 2).toUpperCase()}
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] py-2 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in duration-150">
                                    <div className="px-4 py-2 bg-slate-50/80">
                                        <p className="text-xs font-black text-slate-900 truncate">{user?.fullName || 'Admin User'}</p>
                                        <p className="text-[11px] font-medium text-slate-500 truncate">{user?.email || 'admin@sportamax.com'}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                const fallbackRoute = role === 'owner' ? '/admin/settings' : role === 'superadmin' ? '/super-admin/settings' : `/${role}`;
                                                navigate(profileRouteMap[role] || fallbackRoute);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                        >
                                            <HiUser className="w-4 h-4 text-[#10B981]" />
                                            <span>Profile Settings</span>
                                        </button>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                logout();
                                                navigate('/');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                        >
                                            <HiLogout className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8 mt-[72px]"><Outlet /></main>
            </div>

            {/* Notification Data Detail Modal */}
            {selectedNotifData && (
                <Modal
                    isOpen={!!selectedNotifData}
                    onClose={() => setSelectedNotifData(null)}
                    title=""
                    size="lg"
                >
                    <div className="space-y-5 -mt-2">
                        {/* Header Banner with Dark Emerald Gradient & Glassmorphism */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 rounded-2xl text-white border border-emerald-500/20 shadow-lg">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex justify-between items-start gap-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                                        {selectedNotifData.title.includes('Booking') ? '⚡' : selectedNotifData.title.includes('Payment') ? '💳' : selectedNotifData.title.includes('Tournament') ? '🏆' : selectedNotifData.title.includes('Owner') ? '🏢' : '📌'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                {selectedNotifData.dataDetails?.category || 'System Event'}
                                            </span>
                                            <span className="text-slate-400 text-[11px] font-medium">• {selectedNotifData.time || 'Realtime'}</span>
                                        </div>
                                        <h3 className="font-black text-white text-lg tracking-tight mt-1">{selectedNotifData.title}</h3>
                                        <p className="text-xs text-slate-300 font-medium mt-0.5">{selectedNotifData.desc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Details Grid */}
                        {selectedNotifData.dataDetails ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {Object.entries(selectedNotifData.dataDetails).map(([key, val]) => {
                                    const k = key.toLowerCase()
                                    const isAmount = k.includes('amount') || k.includes('price') || k.includes('fee') || k.includes('revenue')
                                    const isStatus = k.includes('status')
                                    const icon = k.includes('id') || k.includes('ref') ? '🔑' : 
                                                 k.includes('name') || k.includes('customer') || k.includes('owner') ? '👤' : 
                                                 k.includes('phone') || k.includes('mobile') ? '📱' : 
                                                 k.includes('venue') || k.includes('turf') || k.includes('court') || k.includes('business') ? '🏟️' : 
                                                 k.includes('sport') || k.includes('game') ? '⚽' : 
                                                 k.includes('time') || k.includes('date') || k.includes('checkin') ? '⏰' : 
                                                 isAmount ? '💰' : isStatus ? '✨' : '📋'

                                    return (
                                        <div 
                                            key={key} 
                                            className="p-3.5 bg-slate-50/80 hover:bg-emerald-50/30 border border-slate-200/80 hover:border-emerald-300 rounded-2xl transition-all shadow-2xs group flex flex-col justify-between"
                                        >
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <span>{icon}</span>
                                                <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            </span>
                                            <div className="mt-1.5">
                                                {isAmount ? (
                                                    <span className="text-emerald-700 font-black text-sm bg-emerald-100/70 px-2.5 py-0.5 rounded-lg border border-emerald-200 inline-block font-mono">
                                                        {String(val)}
                                                    </span>
                                                ) : isStatus ? (
                                                    <span className="text-emerald-800 font-black text-xs bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 inline-block">
                                                        🟢 {String(val)}
                                                    </span>
                                                ) : (
                                                    <span className="font-bold text-slate-800 text-xs block leading-snug">
                                                        {String(val)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 font-medium border border-slate-200">
                                {selectedNotifData.desc}
                            </div>
                        )}

                        {/* Footer Action Buttons */}
                        <div className="flex flex-wrap justify-end items-center gap-2.5 pt-3 border-t border-slate-100">
                            <button
                                onClick={() => setSelectedNotifData(null)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setReceiptModalData(selectedNotifData)}
                                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                            >
                                <span>🧾 View Official Payment Receipt</span>
                            </button>
                            {selectedNotifData.path && (
                                <button
                                    onClick={() => {
                                        const targetPath = selectedNotifData.path
                                        setSelectedNotifData(null)
                                        navigate(targetPath)
                                    }}
                                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
                                >
                                    <span>View Full Record</span> ➔
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
            {/* Official GST Payment Receipt & Tax Invoice Modal */}
            {receiptModalData && (
                <Modal
                    isOpen={!!receiptModalData}
                    onClose={() => setReceiptModalData(null)}
                    title=""
                    size="lg"
                >
                    <div className="space-y-4 text-slate-800 -mt-2">
                        {/* Receipt Header Banner */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 rounded-2xl text-white border border-emerald-500/30 shadow-lg flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                                        OFFICIAL TAX INVOICE RECEIPT
                                    </span>
                                    <span className="text-slate-400 text-xs font-mono">INV-2026-0842</span>
                                </div>
                                <h3 className="text-lg font-black text-white mt-1">SportMatrix Platform Receipt</h3>
                                <p className="text-xs text-slate-300 font-medium">Verified Payment & Slot Reservation Statement</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-black">
                                    🟢 PAID & SETTLED
                                </span>
                            </div>
                        </div>

                        {/* Customer & Venue Information Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Customer Name</span>
                                <span className="font-extrabold text-slate-900 text-xs block mt-0.5 font-mono">
                                    {receiptModalData.dataDetails?.customerName || receiptModalData.dataDetails?.ownerName || 'Rahul Verma'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Contact Phone</span>
                                <span className="font-extrabold text-slate-900 text-xs block mt-0.5 font-mono">
                                    {receiptModalData.dataDetails?.customerPhone || receiptModalData.dataDetails?.mobile || '+91 98765 99999'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Turf Venue / Arena</span>
                                <span className="font-extrabold text-slate-900 text-xs block mt-0.5 font-mono">
                                    {receiptModalData.dataDetails?.turfVenue || receiptModalData.dataDetails?.businessName || 'Champions Turf Arena'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Slot Date & Time</span>
                                <span className="font-extrabold text-slate-900 text-xs block mt-0.5 font-mono">
                                    {receiptModalData.dataDetails?.timeSlot || receiptModalData.dataDetails?.date || '06:00 PM - 07:00 PM (Today)'}
                                </span>
                            </div>
                        </div>

                        {/* Financial Item Breakdown Table */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                                    <tr>
                                        <th className="p-3">Item Description</th>
                                        <th className="p-3 text-right">Tax (18% GST)</th>
                                        <th className="p-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    <tr>
                                        <td className="p-3 font-bold text-slate-800">
                                            {receiptModalData.dataDetails?.category || 'Slot Booking Fee'}
                                            <span className="block text-[11px] text-slate-400 font-normal">
                                                {receiptModalData.desc || 'Standard Box Turf Reservation'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-mono text-slate-600">₹183.05</td>
                                        <td className="p-3 text-right font-bold text-slate-900 font-mono">₹1,016.95</td>
                                    </tr>
                                    <tr className="bg-emerald-50/60 font-black">
                                        <td colSpan="2" className="p-3 text-slate-900 text-right uppercase tracking-wider text-[11px]">
                                            Total Paid Amount (Inclusive of Taxes):
                                        </td>
                                        <td className="p-3 text-right text-emerald-700 text-sm font-mono font-black">
                                            {receiptModalData.dataDetails?.amount || receiptModalData.dataDetails?.settledAmount || '₹1,200.00'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Receipt Footer Actions */}
                        <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100">
                            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                <span>🔒</span> Verified Digital GST Invoice • SportMatrix OS
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>🖨️ Print Receipt</span>
                                </button>
                                <button
                                    onClick={() => setReceiptModalData(null)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
