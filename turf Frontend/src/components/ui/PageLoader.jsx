import React from 'react';

export default function PageLoader({ 
  text = 'Loading Kiaan Turf...', 
  fullScreen = false,
  subtitle = 'KIAAN TECHNOLOGY • CRICKET ARENA' 
}) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 transition-all duration-300"
    : "min-h-[50vh] w-full flex flex-col items-center justify-center p-8 transition-all duration-300";

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center justify-center">
        {/* Glow ambient background effect */}
        <div className="absolute -inset-10 bg-gradient-to-tr from-amber-500/25 via-yellow-400/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

        {/* Outer Orbit & Logo Container */}
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36">
          {/* Outer glowing spinner ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500 border-b-yellow-400 animate-spin" style={{ animationDuration: '1.6s' }} />

          {/* Inner counter-rotating ring */}
          <div className="absolute inset-2 rounded-full border border-dashed border-amber-300/40 border-t-emerald-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2.8s' }} />

          {/* Glowing pulse ring */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 animate-ping opacity-40" />

          {/* Central Kiaan Gold Logo Box */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 p-1 bg-slate-900 border-2 border-amber-400/70 shadow-2xl shadow-amber-500/40 rounded-2xl flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/images/kiaan_gold_logo.jpg?v=2" 
              alt="Kiaan Turf Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Brand Name & Typography */}
        <div className="mt-6 text-center space-y-1 z-10">
          <div className="flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-black tracking-widest uppercase">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
              KIAAN
            </span>
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-md">
              TURF
            </span>
          </div>

          <p className="text-[9.5px] sm:text-[10.5px] font-black tracking-[0.22em] text-amber-500/90 uppercase">
            {subtitle}
          </p>

          {/* Animated Loading Text & Dots */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {text}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



