import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { HiMenu, HiX, HiLogout, HiBell, HiSearch } from 'react-icons/hi'
import sidebarConfig from '../config/sidebarConfig'
import { useAuth } from '../context/AuthContext'

const roleLabels = { superadmin: 'Super Admin', owner: 'Owner / Admin', staff: 'Staff', customer: 'Customer' }

const roleNotifications = {
    superadmin: [
        { id: 1, title: 'New Owner Registered', desc: 'Rajesh Sharma registered Green Arena Sports', time: '10m ago', unread: true },
        { id: 2, title: 'Subscription Upgraded', desc: 'Champion Sports upgraded to Enterprise Plan', time: '1h ago', unread: true },
        { id: 3, title: 'Payout Processed', desc: 'Monthly commission payout of ₹37,500 settled', time: 'Yesterday', unread: false }
    ],
    owner: [
        { id: 1, title: 'New Slot Booking', desc: 'Court A (6 PM - 7 PM) booked by Rahul V.', time: '5m ago', unread: true },
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
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState(roleNotifications[role] || roleNotifications.customer)

    const navigate = useNavigate()
    const { logout } = useAuth()
    const menu = sidebarConfig[role] || []

    useEffect(() => {
        setNotifications(roleNotifications[role] || roleNotifications.customer)
    }, [role])

    // Role-based profile/settings route map matching sidebar config paths
    const profileRouteMap = {
        superadmin: '/dashboard/super-admin/settings',
        owner:      '/dashboard/owner',
        staff:      '/dashboard/staff',
        customer:   '/dashboard/customer/profile',
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
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const hasUnread = notifications.some(n => n.unread)

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    }

    return (
        <div className="min-h-screen bg-surface-50 flex">
            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white text-sm">SM</div>
                    <span className="font-bold text-white tracking-tight">SportMatrix</span>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
                        <HiX className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="px-3 py-2">
                    <div className="px-3 py-2 rounded-xl bg-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">{roleLabels[role]}</div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
                    {menu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === `/dashboard/${role}` || item.path === '/dashboard/super-admin'}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${isActive ? 'bg-primary-600/10 text-primary-400 border-primary-600/20 shadow-[0_0_15px_rgba(var(--color-primary-600-rgb),0.15)]' : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-800 shrink-0">
                    <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer">
                        <HiLogout className="text-lg" /> Logout
                    </button>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 flex flex-col min-w-0">
                <header className="glass-header sticky top-0 z-30 h-16 bg-white/70 backdrop-blur-md border-b border-surface-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface-200/50 cursor-pointer">
                            <HiMenu className="w-5 h-5 text-surface-600" />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 bg-white/50 border border-surface-200 rounded-xl px-3 py-2 w-64">
                            <HiSearch className="w-4 h-4 text-surface-400" />
                            <input placeholder="Search..." className="bg-transparent outline-none text-sm text-surface-700 w-full placeholder:text-surface-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notifications Bell Dropdown */}
                        <div className="relative notif-dropdown-container">
                            <button 
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative p-2 rounded-lg hover:bg-surface-200/50 cursor-pointer transition-colors"
                            >
                                <HiBell className="w-5 h-5 text-surface-500" />
                                {hasUnread && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-surface-200 rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden">
                                    <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-surface-900 text-sm">Notifications</h3>
                                            {hasUnread && (
                                                <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-[10px] font-bold rounded-full">
                                                    {notifications.filter(n => n.unread).length} new
                                                </span>
                                            )}
                                        </div>
                                        {hasUnread && (
                                            <button 
                                                onClick={markAllRead} 
                                                className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 cursor-pointer"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-72 overflow-y-auto divide-y divide-surface-100">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div 
                                                    key={n.id} 
                                                    onClick={() => {
                                                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item))
                                                    }}
                                                    className={`p-3.5 hover:bg-surface-50 transition-colors cursor-pointer flex gap-3 items-start ${n.unread ? 'bg-primary-50/20' : ''}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-primary-500' : 'bg-transparent'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-surface-900 truncate">{n.title}</p>
                                                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-2 leading-relaxed">{n.desc}</p>
                                                        <span className="text-[10px] text-surface-400 mt-1.5 block font-medium">{n.time}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="p-6 text-center text-xs text-surface-400">No notifications</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dynamic User Profile Dropdown */}
                        <div className="relative profile-dropdown-container">
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)} 
                                className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                            >
                                {role.charAt(0).toUpperCase()}
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2.5 w-48 bg-white border border-surface-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in divide-y divide-surface-100">
                                    <div className="px-4 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        Account Ops
                                    </div>
                                    <div className="py-1">
                                        <button 
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                navigate(profileRouteMap[role] || `/dashboard/${role}`);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors flex items-center gap-2"
                                        >
                                            👤 Profile Settings
                                        </button>
                                    </div>
                                    <div className="py-1">
                                        <button 
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                logout();
                                                navigate('/login');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            🚪 Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6"><Outlet /></main>
            </div>
        </div>
    )
}
