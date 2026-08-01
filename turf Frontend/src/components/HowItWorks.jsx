import SectionWrapper from '../layout/SectionWrapper'
import SectionLabel from '../ui/SectionLabel'
import GreenDivider from '../ui/GreenDivider'

const steps = [
    {
        step: '01',
        title: 'Sign Up & Configure',
        description:
            'Register your facility, set up sports, define pricing tiers, and configure time slots in minutes.',
        icon: '🔧',
    },
    {
        step: '02',
        title: 'Go Live & Accept Bookings',
        description:
            'Your facility appears on the public platform. Customers discover, browse, and book slots instantly.',
        icon: '🚀',
    },
    {
        step: '03',
        title: 'Manage Operations',
        description:
            'Handle day-to-day bookings, manage tournaments, track players, and monitor inventory from your dashboard.',
        icon: '📋',
    },
    {
        step: '04',
        title: 'Grow & Scale',
        description:
            'Leverage analytics to optimize pricing, expand to new branches, and scale your business across cities.',
        icon: '📈',
    },
]

export default function HowItWorks() {
    return (
        <SectionWrapper id="how-it-works">
            <div className="text-center mb-16">
                <SectionLabel>How It Works</SectionLabel>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Get Started in{' '}
                    <span className="text-gradient">Four Simple Steps</span>
                </h2>
                <GreenDivider className="!my-4" />
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    From setup to scaling — our platform guides you through every stage of growth.
                </p>
            </div>

            <div className="relative">
                <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent -translate-y-1/2" />

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step) => (
                        <div
                            key={step.step}
                            className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 text-center hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                {step.icon}
                            </div>
                            <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-2 block">
                                Step {step.step}
                            </span>
                            <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    )
}
