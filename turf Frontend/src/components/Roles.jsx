import SectionWrapper from '../layout/SectionWrapper'
import SectionLabel from '../ui/SectionLabel'
import GreenDivider from '../ui/GreenDivider'

const roles = [
    {
        title: 'Super Admin',
        subtitle: 'Platform Owner',
        tint: 'from-purple-500/15 to-purple-500/5',
        borderHover: 'hover:border-purple-500/30',
        accent: 'text-purple-400',
        accentBg: 'bg-purple-500/10',
        icon: '👑',
        capabilities: [
            'Full system control',
            'Branch management',
            'Revenue tracking',
            'Subscription plans',
            'Commission settings',
            'User management',
            'Dispute resolution',
            'Payment logs',
        ],
    },
    {
        title: 'Owner / Admin',
        subtitle: 'Branch Business Owner',
        tint: 'from-rose-500/15 to-rose-500/5',
        borderHover: 'hover:border-rose-500/30',
        accent: 'text-rose-400',
        accentBg: 'bg-rose-500/10',
        icon: '🏢',
        capabilities: [
            'Business dashboard',
            'Sports & pricing',
            'Slot management',
            'Booking control',
            'Tournaments',
            'Wallet & payments',
            'Inventory tracking',
            'Staff management',
        ],
    },
    {
        title: 'Staff',
        subtitle: 'Manager / Cashier / Tech',
        tint: 'from-amber-500/15 to-amber-500/5',
        borderHover: 'hover:border-amber-500/30',
        accent: 'text-amber-400',
        accentBg: 'bg-amber-500/10',
        icon: '⚙️',
        capabilities: [
            'Role-based access',
            'Booking operations',
            'Match updates',
            'POS billing',
            'Refund handling',
            'Maintenance logs',
            'Equipment status',
            'Limited permissions',
        ],
    },
    {
        title: 'Customer',
        subtitle: 'Player / Team Member',
        tint: 'from-emerald-500/15 to-emerald-500/5',
        borderHover: 'hover:border-emerald-500/30',
        accent: 'text-emerald-400',
        accentBg: 'bg-emerald-500/10',
        icon: '🎮',
        capabilities: [
            'Personal dashboard',
            'Slot booking',
            'Team management',
            'Match history',
            'Performance stats',
            'Wallet system',
            'Tournament access',
            'Hire applications',
        ],
    },
]

export default function Roles() {
    return (
        <SectionWrapper id="roles">
            <div className="text-center mb-16">
                <SectionLabel>User Roles</SectionLabel>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Built for <span className="text-gradient">Every Role</span>
                </h2>
                <GreenDivider className="!my-4" />
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Four distinct dashboard experiences, each tailored to specific responsibilities
                    with role-based access control.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roles.map((role) => (
                    <div
                        key={role.title}
                        className={`relative bg-gradient-to-b ${role.tint} backdrop-blur-2xl border border-white/10 ${role.borderHover} rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                    >
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl ${role.accentBg} flex items-center justify-center text-2xl mb-4`}>
                                {role.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{role.title}</h3>
                            <p className={`text-sm ${role.accent} mb-5`}>{role.subtitle}</p>
                            <ul className="space-y-2.5">
                                {role.capabilities.map((cap) => (
                                    <li key={cap} className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className={`w-1.5 h-1.5 rounded-full ${role.accentBg} shrink-0`} />
                                        {cap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </SectionWrapper>
    )
}
