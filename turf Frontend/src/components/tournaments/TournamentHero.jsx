import React from 'react';
import TournamentSearchBar from './TournamentSearchBar';
import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineLightningBolt, HiOutlineStatusOnline } from 'react-icons/hi';

export default function TournamentHero() {
    return (
        <div className="w-full relative border-b border-white/5 bg-[#020617] z-50">
            <div className="w-full px-5 md:px-10 lg:px-20 py-8 relative z-50">
                <div className="flex flex-col gap-4">
                    {/* Search Container */}
                    <div className="relative z-50 w-full">
                        <TournamentSearchBar />
                    </div>
                </div>
            </div>
        </div>
    );
}
