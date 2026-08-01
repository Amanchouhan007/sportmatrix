import SectionWrapper from '../layout/SectionWrapper'
import SectionLabel from '../ui/SectionLabel'
import GreenDivider from '../ui/GreenDivider'
import GlassCard from '../ui/GlassCard'
import IconBox from '../ui/IconBox'

const features = [
    {
        icon: '📅',
        title: 'Online Booking System',
        description:
            'Complete slot booking with calendar view, dynamic pricing, peak hours, and add-on management for seamless customer experience.',
    },
    {
        icon: '🏆',
        title: 'Tournament Engine',
        description:
            'Create and manage tournaments with bracket configurations, entry fees, prize pools, team registrations, and live bracket views.',
    },
    {
        icon: '👥',
        title: 'Player Marketplace',
        description:
            'Open team requirements, player applications, bid amounts, role selection, and escrow-based payment system for secure hiring.',
    },
    {
        icon: '📊',
        title: 'Revenue Analytics',
        description:
            'Daily and monthly revenue tracking, sport-wise income analysis, peak hour detection, and growth metrics with visual charts.',
    },
    {
        icon: '🏢',
        title: 'Multi-Branch Management',
        description:
            'Scale across cities with centralized control, branch-level dashboards, subscription-based access, and commission tracking.',
    },
    {
        icon: '💳',
        title: 'Wallet & Payments',
        description:
            'Integrated wallet system with online payment gateway, escrow logic, commission auto-deduction, and automated refund processing.',
    },
    {
        icon: '📦',
        title: 'Inventory & Equipment',
        description:
            'Track equipment stock levels, get low-stock alerts, manage add-on items, and maintain a complete inventory across branches.',
    },
    {
        icon: '🔧',
        title: 'Maintenance Tracking',
        description:
            'Schedule cleaning, track equipment servicing, log downtime, and assign technicians for proactive facility upkeep.',
    },
    {
        icon: '🛡️',
        title: 'Role-Based Access Control',
        description:
            'Secure JWT authentication with role-based routing, middleware permissions, and token expiration handling across all dashboards.',
    },
]

export default function Features() {
    return (
        <SectionWrapper id="features">
            <div className="text-center mb-16">
                <SectionLabel>Platform Features</SectionLabel>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Everything You Need to{' '}
                    <span className="text-gradient">Run Your Business</span>
                </h2>
                <GreenDivider className="!my-4" />
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    A comprehensive suite of tools designed for sports turfs.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                    <GlassCard key={feature.title} className="space-y-3">
                        <IconBox>{feature.icon}</IconBox>
                        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </GlassCard>
                ))}
            </div>
        </SectionWrapper>
    )
}
