import React from 'react';
import { HiOutlineLightningBolt, HiOutlineCalendar, HiOutlineStar, HiOutlineMail } from 'react-icons/hi';

export default function TournamentLowerSections() {
    return (
        <div className="mt-16 space-y-16">
            


            {/* 3. CALENDAR & NEARBY */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <HiOutlineCalendar className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-black uppercase text-white tracking-widest">Tournament Calendar</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                        {['August', 'September', 'October'].map((month, idx) => (
                            <div key={idx} className={`shrink-0 w-48 rounded-2xl p-4 border ${idx === 0 ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-950/50 border-white/5'}`}>
                                <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${idx === 0 ? 'text-blue-400' : 'text-slate-400'}`}>{month}</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-300">15th - Football</span>
                                        <span className="text-amber-400">₹50K</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-300">20th - Football</span>
                                        <span className="text-amber-400">₹20K</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nearby */}
                <div className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-white/5">
                    <h3 className="text-sm font-black uppercase text-white tracking-widest mb-6">Nearby You</h3>
                    <div className="space-y-2">
                        {['Within 5 KM', 'Within 10 KM', 'Within 25 KM'].map((range, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-white/5 cursor-pointer hover:border-white/20">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{range}</span>
                                <span className="text-[10px] font-black text-emerald-400">{3 * (idx + 1)} Found</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. RECENT WINNERS */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <HiOutlineStar className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase text-white tracking-widest">Recent Champions</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                    {[
                        { team: 'Team Titans', prize: '₹50,000', sport: 'Football' },
                        { team: 'Smash Masters', prize: '₹20,000', sport: 'Football' },
                        { team: 'Cricket Kings', prize: '₹80,000', sport: 'Cricket' }
                    ].map((w, idx) => (
                        <div key={idx} className="bg-gradient-to-t from-slate-900 to-slate-900/40 p-6 rounded-2xl border border-amber-500/20 text-center relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform">
                            <div className="text-3xl mb-2">🥇</div>
                            <h4 className="text-lg font-black text-white italic uppercase">{w.team}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{w.sport} Champions</p>
                            <div className="text-amber-400 font-black">{w.prize}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. REVIEWS & SPONSORS */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Reviews */}
                <div className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-white/5">
                    <h3 className="text-sm font-black uppercase text-white tracking-widest mb-6">What Players Say</h3>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, j) => <HiOutlineStar key={j} className="w-3 h-3 text-amber-400" fill="currentColor" />)}
                                </div>
                                <h4 className="text-xs font-black text-white uppercase mb-1">Great Tournament</h4>
                                <p className="text-[10px] text-slate-400 font-medium">"Very organized, awesome venue, and fair referring. Will definitely join the next season."</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ & Newsletter */}
                <div className="flex flex-col gap-8">
                    {/* FAQ Quick Links */}
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex-1">
                        <h3 className="text-sm font-black uppercase text-white tracking-widest mb-4">Quick FAQ</h3>
                        <div className="flex flex-wrap gap-2">
                            {['How to Join', 'Refund Policy', 'Rules & Regulations', 'Documents Required', 'Age Limit'].map((q, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-slate-950 border border-white/10 rounded-full text-[9px] font-bold text-slate-300 uppercase tracking-widest cursor-pointer hover:border-white/30">
                                    {q}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 p-6 rounded-3xl border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <HiOutlineMail className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-widest">Never Miss a Tourney</h3>
                        </div>
                        <p className="text-[9px] text-emerald-100/60 font-bold uppercase tracking-widest mb-4">Get alerted for high-prize tournaments.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Enter Email" className="flex-1 bg-slate-950 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500" />
                            <button className="px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sponsors */}
            <div className="pt-8 pb-4 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mb-6">Trusted By Elite Brands</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Simulated Text Logos instead of images for simplicity */}
                    <span className="text-xl font-black italic tracking-tighter text-white">ADIDAS</span>
                    <span className="text-xl font-black italic tracking-tighter text-white">NIKE</span>
                    <span className="text-xl font-black italic tracking-tighter text-white">PUMA</span>
                    <span className="text-xl font-black italic tracking-tighter text-white">DECATHLON</span>
                    <span className="text-xl font-black italic tracking-tighter text-white">RED BULL</span>
                </div>
            </div>

        </div>
    );
}
