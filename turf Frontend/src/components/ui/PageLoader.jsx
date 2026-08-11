import React from 'react';

export default function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        {/* Animated outer ring */}
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-[#16A34A] animate-spin" />
        {/* Inner pulse */}
        <div className="absolute w-5 h-5 rounded-full bg-[#C8FF2E]/30 animate-ping" />
        <div className="absolute w-3 h-3 rounded-full bg-[#16A34A]" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
        {text}
      </p>
    </div>
  );
}
