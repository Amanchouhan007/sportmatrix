import { useState } from 'react'
import SectionWrapper from '../layout/SectionWrapper'
import SectionLabel from '../ui/SectionLabel'
import GreenDivider from '../ui/GreenDivider'
import GlassCard from '../ui/GlassCard'

const modulesData = {
    'Public Website': {
        description:
            'Customer-facing platform for marketing, browsing facilities, booking slots, joining tournaments, and hiring players.',
        items: [
            'Hero Section & Featured Sports',
            'All Turfs Listing with Filters',
            'Turf Detail Page with Slot Calendar',
            'Slot Booking with Dynamic Pricing',
            'Tournament Listing & Registration',
            'Player Marketplace & Bidding',
            'Membership Plans (Bronze / Silver / Gold)',
            'Login / Register with OTP Verification',
        ],
    },
    'Super Admin': {
        description:
            'Complete system-level control for the platform owner with branch management, subscriptions, and global analytics.',
        items: [
            'Dashboard Overview with Revenue & Users',
            'Branch Management & Activation',
            'Owner Management & Commission Tracking',
            'Subscription Plan CRUD',
            'Commission Settings (Sport-wise)',
            'Global Revenue & Growth Analytics',
            'User Management & Account Control',
            'Payment Logs & Dispute Resolution',
        ],
    },
    'Owner Admin': {
        description:
            'Complete business control for facility owners including sports, slots, bookings, tournaments, and analytics.',
        items: [
            'Dashboard with Today\'s Revenue & Bookings',
            'Sports Management with Pricing',
            'Slot Management & Holiday Calendar',
            'Booking Approval & Walk-in Support',
            'Tournament Creation & Bracket Config',
            'Player & Team Management',
            'Wallet, Escrow & Commission View',
            'Reports with Charts & Peak Hour Data',
            'Inventory & Equipment Tracking',
            'Maintenance & Staff Management',
        ],
    },
    'Staff Panel': {
        description:
            'Operational-level control with role-specific access for managers, cashiers, and technicians.',
        items: [
            'Manager: Booking Management',
            'Manager: Match Result Updates',
            'Manager: Tournament Operations',
            'Cashier: POS Billing System',
            'Cashier: Refund Handling',
            'Cashier: Payment Tracking',
            'Technician: Maintenance Logs',
            'Technician: Equipment Status Updates',
        ],
    },
    'Customer Hub': {
        description:
            'Community and booking experience for players with personal dashboards, teams, matches, and wallet.',
        items: [
            'Personal Dashboard & Upcoming Bookings',
            'Booking History & Cancellation',
            'Team Creation & Player Management',
            'Match History & Performance Stats',
            'Player Profile with Skill Level',
            'Wallet with Add Money & Transactions',
            'Tournament Registration & Bracket View',
            'Hire Request Applications & Status',
        ],
    },
}

const tabKeys = Object.keys(modulesData)

export default function Modules() {
    const [activeTab, setActiveTab] = useState(tabKeys[0])
    const activeModule = modulesData[activeTab]

    return (
        <SectionWrapper id="modules">
            <div className="text-center mb-16">
                <SectionLabel>System Modules</SectionLabel>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Five Powerful <span className="text-gradient">Dashboards</span>
                </h2>
                <GreenDivider className="!my-4" />
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Each role gets a purpose-built dashboard with dedicated features and controls.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {tabKeys.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === tab
                                ? 'bg-emerald-500 text-white scale-105 shadow-lg shadow-emerald-500/25'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <GlassCard hover={false} className="max-w-4xl mx-auto !p-8">
                <p className="text-slate-400 mb-8 text-center text-lg">{activeModule.description}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                    {activeModule.items.map((item, index) => (
                        <div
                            key={item}
                            className="flex items-start gap-3 bg-white/3 rounded-xl px-4 py-3 border border-white/5 hover:border-emerald-500/20 transition-colors duration-200"
                        >
                            <span className="text-emerald-400 font-bold text-sm mt-0.5">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="text-sm text-slate-300">{item}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </SectionWrapper>
    )
}
