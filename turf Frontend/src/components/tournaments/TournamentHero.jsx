import React from 'react';
import TournamentSearchBar from './TournamentSearchBar';
import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineLightningBolt, HiOutlineStatusOnline } from 'react-icons/hi';

export default function TournamentHero() {
    return (
        <div className="m-0 p-0 h-[calc(100vh-97px)]">
            <div className="bg-[#0b1120] overflow-hidden shadow-2xl relative h-full">
                {/* 2 Column Layout */}
                <div className="flex flex-col lg:flex-row h-full">
                    {/* Left: Image */}
                    <div className="lg:w-[45%] relative min-h-[300px] lg:min-h-full">
                        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0b1120] via-transparent to-[#0b1120] z-10" />
                        <img 
                            src="/images/champions_trophy.png" 
                            alt="Champions Trophy" 
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                    </div>

                    {/* Right: Content */}
                    <div className="lg:w-[55%] p-8 lg:py-12 lg:pr-12 relative z-20 flex flex-col justify-center">
                        <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg mb-2">
                            TOURNEY<span className="text-amber-500">HUB</span>
                        </h1>
                        <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight mb-2">
                            Compete. Win. Rise to the Top.
                        </h2>
                        <p className="text-slate-400 font-medium text-sm lg:text-base mb-8">
                            Elite verified tournaments across India.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-10">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🏆</span>
                                <div className="text-left">
                                    <div className="text-sm font-black text-white tabular-nums leading-tight">146</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-tight">Active</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-xl">👥</span>
                                <div className="text-left">
                                    <div className="text-sm font-black text-white tabular-nums leading-tight">3845</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-tight">Players</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xl">💰</span>
                                <div className="text-left">
                                    <div className="text-sm font-black text-white tabular-nums leading-tight">₹24.5L</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-tight">Prize</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📍</span>
                                <div className="text-left">
                                    <div className="text-sm font-black text-white tabular-nums leading-tight">28</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-tight">Cities</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xl">⭐</span>
                                <div className="text-left">
                                    <div className="text-sm font-black text-white tabular-nums leading-tight">126</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-tight">Organizers</div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mt-auto lg:mt-0">
                            <TournamentSearchBar />
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}
