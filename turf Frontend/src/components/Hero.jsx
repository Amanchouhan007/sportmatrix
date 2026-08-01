import PrimaryButton from '../ui/PrimaryButton'
import SecondaryButton from '../ui/SecondaryButton'

export default function Hero() {
    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-[#020617]">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&q=80&w=2000')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/60 to-[#020617]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />

                {/* Glowing light beams from bottom/top */}
                <div className="absolute bottom-0 left-[20%] w-[30%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-0 right-[10%] w-[40%] h-[50%] bg-cyan-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Content */}
                    <div className="space-y-8">
                        <div>
                            <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[11px] font-bold text-emerald-300 tracking-[0.2em] uppercase mt-0.5">
                                    Next-Gen Sports Ecosystem
                                </span>
                            </span>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                                DOMINATE <br />
                                YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">ARENA</span>
                            </h1>
                        </div>

                        <p className="text-lg sm:text-xl text-slate-300 max-w-xl font-light leading-relaxed drop-shadow-md">
                            The ultimate operating system for sports turfs. Connect players, automate bookings, and scale your sports business like never before.
                        </p>

                        <div className="flex flex-wrap gap-5 pt-2">
                            <button
                                onClick={() => scrollTo('cta')}
                                className="group relative px-8 py-4 rounded-full bg-emerald-500 text-slate-950 font-bold tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                            >
                                <span className="relative flex items-center gap-2">
                                    Launch Platform
                                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </span>
                            </button>
                            <button
                                onClick={() => scrollTo('features')}
                                className="px-8 py-4 rounded-full text-white font-semibold tracking-wide border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
                            >
                                Explore Tech
                            </button>
                        </div>
                    </div>

                    {/* Right side left empty as requested */}
                    <div className="hidden lg:block relative w-full h-[400px] lg:h-[600px]"></div>
                </div>
            </div>

            {/* Fade out to black at the bottom */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
        </section>
    )
}
