import SectionWrapper from '../layout/SectionWrapper'

const stats = [
    { value: '500+', label: 'Facilities Managed', icon: '🏟️' },
    { value: '50K+', label: 'Bookings Processed', icon: '📅' },
    { value: '10K+', label: 'Active Players', icon: '🏆' },
    { value: '99.9%', label: 'Uptime Guarantee', icon: '⚡' },
]

export default function StatsBar() {
    return (
        <SectionWrapper className="!py-12 md:!py-16 lg:!py-20 border-y border-white/5 bg-white/[0.02]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="text-center space-y-2">
                        <span className="text-2xl">{stat.icon}</span>
                        <p className="text-3xl lg:text-4xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>
        </SectionWrapper>
    )
}
