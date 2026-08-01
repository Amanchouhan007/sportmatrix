import SectionWrapper from '../layout/SectionWrapper'
import SectionLabel from '../ui/SectionLabel'
import GreenDivider from '../ui/GreenDivider'

const testimonials = [
    {
        name: 'Rajesh Kumar',
        role: 'Turf Owner, Chennai',
        quote:
            'SportMatrix transformed how we manage our three turf locations. Revenue tracking and slot management are now effortless. Our booking rate increased by 40% in the first quarter.',
        avatar: 'RK',
        rating: 5,
    },
    {
        name: 'Priya Sharma',
        role: 'Gaming Arena Manager, Mumbai',
        quote:
            'The tournament engine is a game-changer. We run weekly esports competitions now with automated brackets, and the competitive gaming ecosystem brought in an amazing community.',
        avatar: 'PS',
        rating: 5,
    },
    {
        name: 'Arjun Mehta',
        role: 'Sports Facility Director, Delhi',
        quote:
            'From inventory tracking to staff management, everything is in one place. The multi-branch capability let us scale from 1 to 5 facilities without any operational headaches.',
        avatar: 'AM',
        rating: 5,
    },
]

export default function Testimonials() {
    return (
        <SectionWrapper id="testimonials" className="bg-white/[0.01]">
            <div className="text-center mb-16">
                <SectionLabel>Testimonials</SectionLabel>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Trusted by{' '}
                    <span className="text-gradient">Industry Leaders</span>
                </h2>
                <GreenDivider className="!my-4" />
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Hear from facility owners and managers who transformed their business with SportMatrix.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                    <div
                        key={t.name}
                        className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                        <div className="flex gap-1 mb-5">
                            {Array.from({ length: t.rating }).map((_, i) => (
                                <span key={i} className="text-emerald-400 text-sm">★</span>
                            ))}
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1">
                            &ldquo;{t.quote}&rdquo;
                        </p>
                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                                {t.avatar}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{t.name}</p>
                                <p className="text-xs text-slate-500">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </SectionWrapper>
    )
}
