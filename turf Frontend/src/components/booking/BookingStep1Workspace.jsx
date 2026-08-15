import React from 'react'
import { HiArrowRight } from 'react-icons/hi'

/**
 * BookingStep1Workspace — Step 1 right workspace component (Mini banner, Duration selector, Date strip, Slot grid, Umpire add-on, Summary sticky bar)
 */
export default function BookingStep1Workspace({
    selectedVenue,
    durationHours,
    setDurationHours,
    dateList,
    selectedDateObj,
    setSelectedDateObj,
    allTimeSlots,
    selectedSlotTime,
    setSelectedSlotTime,
    hasVerifiedUmpire,
    setHasVerifiedUmpire,
    currentSlotPrice,
    grossRent,
    discountAmount,
    totalRent,
    appliedOffer,
    setActiveStep,
    setIsGalleryModalOpen
}) {
    return (
        <div className="space-y-6">
            {/* Top Venue Mini Banner */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <img
                        src={selectedVenue.image || '/images/turf1.png'}
                        alt={selectedVenue.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-black text-[#111827]">{selectedVenue.name}</h2>
                            <span className="text-[10px] font-black bg-emerald-100 text-[#065F46] px-2 py-0.5 rounded-full border border-emerald-300">
                                Verified Turf
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            📍 {selectedVenue.location}, {selectedVenue.city}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsGalleryModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black text-[#10B981] hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-2 rounded-xl border border-emerald-200 transition-all cursor-pointer"
                >
                    <span>View Spec Sheet</span> <span>→</span>
                </button>
            </div>

            {/* Main Booking Container */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-7 shadow-sm space-y-7">
                {/* Header & Duration Selector */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">Pick date & time slot</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Select match duration, preferred date and an available slot</p>
                    </div>

                    {/* Duration Hours Selector */}
                    <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black tracking-wider text-slate-500 uppercase">
                            DURATION:
                        </span>
                        <div className="flex items-center bg-[#F1F5F9] border border-slate-200 rounded-full p-1 shadow-xs">
                            {[1, 2, 3].map((hr) => (
                                <button
                                    key={hr}
                                    type="button"
                                    onClick={() => setDurationHours(hr)}
                                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        durationHours === hr
                                            ? 'bg-[#111827] text-white shadow-xs'
                                            : 'text-slate-500 hover:text-[#111827]'
                                    }`}
                                >
                                    {hr} {hr === 1 ? 'HOUR' : 'HOURS'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SELECT DATE Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                            SELECT DATE
                        </h3>
                        <span className="text-[10px] text-slate-400 font-semibold hidden sm:block">
                            {dateList.length} days available
                        </span>
                    </div>

                    {/* Responsive horizontal date strip */}
                    <div
                        className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar"
                        style={{
                            scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {dateList.map((d) => {
                            const isSelected = selectedDateObj.id === d.id
                            const isToday = d.dayShort === 'TODAY'
                            return (
                                <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => setSelectedDateObj(d)}
                                    style={{ scrollSnapAlign: 'start' }}
                                    className={`flex-shrink-0 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
                                        w-14 sm:w-18 md:w-20
                                        py-3 sm:py-3.5 md:py-4
                                        px-1 sm:px-2
                                        rounded-2xl sm:rounded-[20px]
                                        ${
                                            isSelected
                                                ? 'bg-[#111827] text-white border-2 border-[#10B981] shadow-lg scale-105'
                                                : isToday
                                                    ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-700 hover:border-emerald-500'
                                                    : 'bg-white border border-[#E2E8F0] text-slate-500 hover:border-slate-400 hover:shadow-sm'
                                        }`}
                                >
                                    <span className={`text-[9px] sm:text-[10px] font-black mb-0.5 sm:mb-1 tracking-wide ${
                                        isSelected ? 'text-emerald-400' : isToday ? 'text-emerald-600' : 'text-slate-400'
                                    }`}>
                                        {d.dayShort}
                                    </span>
                                    <span className={`text-xl sm:text-2xl md:text-3xl font-black leading-none my-0.5 ${
                                        isSelected ? 'text-white' : isToday ? 'text-emerald-700' : 'text-[#111827]'
                                    }`}>
                                        {d.dateNum}
                                    </span>
                                    <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 sm:mt-1 ${
                                        isSelected ? 'text-slate-300' : isToday ? 'text-emerald-500' : 'text-slate-400'
                                    }`}>
                                        {d.monthShort}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* AVAILABLE SLOTS Section */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#6B7280]">
                            AVAILABLE SLOTS — {selectedDateObj.formattedLabel}
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold">
                            <span className="flex items-center gap-1.5 text-slate-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300" /> Available
                            </span>
                            <span className="flex items-center gap-1.5 text-[#16A34A]">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A]" /> Selected
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300 line-through" /> Booked
                            </span>
                        </div>
                    </div>

                    {/* Slot Grid (4 columns) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {allTimeSlots.map((slot, index) => {
                            const selectedIndex = allTimeSlots.findIndex((s) => s.id === selectedSlotTime)
                            const isSlotInSelectedRange = selectedIndex !== -1 && index >= selectedIndex && index < selectedIndex + durationHours
                            const isRangeStart = index === selectedIndex
                            const rangePosition = index - selectedIndex + 1

                            const isBooked = slot.status === 'booked'
                            const isMaintenance = slot.status === 'maintenance'
                            const isStaffUnavail = slot.status === 'staff_unavailable'
                            const isDisabled = isBooked || isMaintenance || isStaffUnavail

                            // Check if starting at this slot can fulfill durationHours
                            const canFulfillConsecutive = Array.from({ length: durationHours }).every((_, i) => {
                                const candidate = allTimeSlots[index + i]
                                return candidate && candidate.status === 'available'
                            })

                            return (
                                <button
                                    key={slot.id}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                        if (!canFulfillConsecutive && durationHours > 1) {
                                            return;
                                        }
                                        setSelectedSlotTime(slot.id)
                                    }}
                                    className={`py-3.5 px-3 rounded-[22px] text-center flex flex-col items-center justify-center gap-1 min-h-[76px] transition-all duration-200 ${
                                        isSlotInSelectedRange
                                            ? 'bg-[#10B981] text-white border-2 border-[#059669] shadow-lg shadow-emerald-500/20 scale-[1.02] cursor-pointer'
                                            : isBooked
                                            ? 'bg-[#F8FAFC] text-slate-300 border border-slate-100 opacity-75 cursor-not-allowed'
                                            : isMaintenance
                                            ? 'bg-[#FEFCE8] text-[#854D0E] border-2 border-[#FDE047] cursor-not-allowed'
                                            : isStaffUnavail
                                            ? 'bg-[#F1F5F9] text-slate-600 border-2 border-slate-200 cursor-not-allowed'
                                            : !canFulfillConsecutive && durationHours > 1
                                            ? 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                            : 'bg-[#ECFDF5] border-2 border-[#10B981] hover:bg-emerald-100/60 text-slate-900 cursor-pointer shadow-xs'
                                    }`}
                                >
                                    <span className={`text-sm sm:text-base font-black tracking-tight ${isSlotInSelectedRange ? 'text-white' : isBooked ? 'text-slate-300 line-through' : isMaintenance ? 'text-[#854D0E]' : isStaffUnavail ? 'text-slate-700' : 'text-[#111827]'}`}>
                                        {slot.time}
                                    </span>

                                    {isMaintenance ? (
                                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] border border-[#FACC15] flex items-center gap-1">
                                            🛠️ MAINTENANCE
                                        </span>
                                    ) : isStaffUnavail ? (
                                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-slate-700 border border-slate-300 flex items-center gap-1">
                                            🚫 STAFF UNAVAIL
                                        </span>
                                    ) : isBooked ? (
                                        <span className="text-[11px] font-bold text-slate-400">Booked</span>
                                    ) : isSlotInSelectedRange && durationHours > 1 ? (
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isRangeStart ? 'bg-white text-[#065F46]' : 'bg-emerald-600 text-white'}`}>
                                            {isRangeStart ? `START (1/${durationHours})` : `HOUR ${rangePosition}/${durationHours}`}
                                        </span>
                                    ) : !canFulfillConsecutive && durationHours > 1 ? (
                                        <span className="text-[9px] font-bold text-slate-400">
                                            UNAVAILABLE ({durationHours}h)
                                        </span>
                                    ) : (
                                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full font-mono ${isSlotInSelectedRange ? 'bg-white/20 text-white' : 'bg-[#D1FAE5] text-[#065F46]'}`}>
                                            ₹{slot.price}/hr
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Verified Umpire Add-on Selector */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-[#ECFDF5] border-2 border-emerald-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white border border-emerald-300 flex items-center justify-center text-xl shadow-xs shrink-0">
                            ⚖️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-[#111827]">Include Verified Match Umpire</h4>
                                <span className="bg-[#10B981] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    + ₹300
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">BCCI/State certified neutral umpire & digital match scorekeeper</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setHasVerifiedUmpire(!hasVerifiedUmpire)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
                            hasVerifiedUmpire
                                ? 'bg-[#10B981] text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400'
                        }`}
                    >
                        {hasVerifiedUmpire ? '✓ UMPIRE ADDED' : '+ ADD UMPIRE'}
                    </button>
                </div>

                {/* Selected Slot Summary Bar & Action CTA */}
                {selectedSlotTime && (
                    <div className="bg-[#111827] text-white p-5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                SELECTED SLOT SUMMARY
                            </div>
                            <div className="text-lg font-black text-white mt-0.5">
                                {selectedDateObj.dayShort} {selectedDateObj.dateNum} {selectedDateObj.monthShort} · {allTimeSlots.find(s => s.id === selectedSlotTime)?.time} ({durationHours} {durationHours > 1 ? 'Hrs' : 'Hr'})
                            </div>
                            <div className="text-xs text-slate-300 font-medium flex items-center gap-2 mt-1">
                                <span>Slot Rent: <strong className="font-mono text-white">₹{currentSlotPrice.toLocaleString('en-IN')}/hr</strong></span>
                                {hasVerifiedUmpire && <span className="text-emerald-400 font-bold">+ Umpire ₹300</span>}
                                {appliedOffer && discountAmount > 0 && <span className="text-amber-400 font-bold">(-₹{discountAmount} Promo)</span>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL RENT</span>
                                <span className="text-2xl font-black font-mono text-[#C8FF2E]">₹{totalRent.toLocaleString('en-IN')}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveStep(2)}
                                className="bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2 border border-[#B5F000]"
                            >
                                <span>Next: Payment mode</span>
                                <HiArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
