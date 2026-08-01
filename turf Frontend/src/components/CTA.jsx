import SectionWrapper from '../layout/SectionWrapper'
import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

export default function CTA() {
    return (
        <SectionWrapper id="cta">
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900/80 border border-white/10 px-8 py-20 sm:px-16 sm:py-24 text-center">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <span className="uppercase tracking-wider text-emerald-400 text-xs font-semibold inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
                        Ready to Transform?
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                        Start Managing Your Sports Business{' '}
                        <span className="text-gradient">Like a Pro</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Join 500+ facilities already using SportMatrix to streamline operations,
                        boost revenue, and deliver exceptional customer experiences.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <PrimaryButton className="text-lg !px-10 !py-4">
                            Start Free Trial
                        </PrimaryButton>
                        <SecondaryButton className="text-lg !px-10 !py-4">
                            Schedule Demo
                        </SecondaryButton>
                    </div>
                    <p className="text-sm text-slate-500">
                        No credit card required · 14-day free trial · Cancel anytime
                    </p>
                </div>
            </div>
        </SectionWrapper>
    )
}
