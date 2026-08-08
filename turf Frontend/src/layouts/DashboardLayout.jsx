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
    HiLightningBolt
} from 'react-icons/hi'
import {
    HiTrophy,
    HiTicket,
    HiUserGroup,
    HiDocumentText
} from 'react-icons/hi2'
import sidebarConfig from '../config/sidebarConfig'
import { useAuth } from '../context/AuthContext'

const roleLabels = { superadmin: 'Super Admin', owner: 'ADMIN', staff: 'Staff', customer: 'Customer' }

const roleNotifications = {
    superadmin: [
        { id: 1, title: 'New Owner Registered', desc: 'Rajesh Sharma registered Green Arena Sports', time: '10m ago', unread: true },
        { id: 2, title: 'Subscription Upgraded', desc: 'Champion Sports upgraded to Enterprise Plan', time: '1h ago', unread: true },
        { id: 3, title: 'Payout Processed', desc: 'Monthly commission payout of ₹37,500 settled', time: 'Yesterday', unread: false }
    ],
    owner: [
        { id: 1, title: 'New Slot Booking', desc: 'Turf A (6 PM - 7 PM) booked by Rahul V.', time: '5m ago', unread: true },
        { id: 2, title: 'Payment Received', desc: 'Received ₹1,200 via UPI', time: '25m ago', unread: true },
        { id: 3, title: 'Tournament Open', desc: 'Registration open for Premier Cricket League', time: '2h ago', unread: false }
    ],
    staff: [
        { id: 1, title: 'Customer Check-in', desc: 'Rahul V. checked in for Court A slot', time: '12m ago', unread: true },
        { id: 2, title: 'Equipment Alert', desc: 'Maintenance check required for Floodlight #3', time: '45m ago', unread: true },
        { id: 3, title: 'POS Bill Completed', desc: 'Order #104 bill generated (₹450)', time: '3h ago', unread: false }
    ],
    customer: [
        { id: 1, title: 'Booking Confirmed!', desc: 'Cricket at SportZone Arena on Mar 15, 10:00 AM', time: '15m ago', unread: true },
        { id: 2, title: 'Tournament Registered', desc: 'Successfully registered for Premier Cricket Cup', time: '2h ago', unread: true },
        { id: 3, title: 'Wallet Credited', desc: '₹500 promotional cashback added to wallet', time: '1d ago', unread: false }
    ]
}

export default function DashboardLayout({ role = 'owner' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [quickActionOpen, setQuickActionOpen] = useState(false)
    const [notifications, setNotifications] = useState(roleNotifications[role] || roleNotifications.customer)
    
    // Collapsible Menu Open States
    const [openMenus, setOpenMenus] = useState({})

    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()
    const menu = sidebarConfig[role] || []

    useEffect(() => {
        setNotifications(roleNotifications[role] || roleNotifications.customer)
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
        owner: '/admin',
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

    const quickActionItems = [
        { label: 'Add Booking', icon: <HiTicket className="w-4 h-4 text-emerald-600" />, path: '/admin/pos' },
        { label: 'Add Turf', icon: <HiLightningBolt className="w-4 h-4 text-[#10B981]" />, path: '/admin/sports' },
        { label: 'Add Tournament', icon: <HiTrophy className="w-4 h-4 text-amber-500" />, path: '/admin/tournaments/all' },
        { label: 'Add Team', icon: <HiUserGroup className="w-4 h-4 text-blue-500" />, path: '/admin/teams' },
        { label: 'Create Invoice', icon: <HiDocumentText className="w-4 h-4 text-indigo-500" />, path: '/admin/pos' },
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
                        onClick={() => { logout(); navigate('/login'); }} 
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
                <header className="sticky top-0 z-30 h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-2xs">
                    {/* Left: Mobile Toggle & Global Search */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer text-slate-700">
                            <HiMenu className="w-5 h-5" />
                        </button>

                        <div className="relative hidden md:block w-72 lg:w-96">
                            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
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
                                                const fallbackRoute = role === 'owner' ? '/admin' : role === 'superadmin' ? '/super-admin' : `/${role}`;
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
                                                navigate('/login');
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

                <main className="flex-1 p-4 sm:p-6 md:p-8"><Outlet /></main>
            </div>
        </div>
    )
}
