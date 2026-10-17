import React from 'react';
import hypervisionLogo from '../assets/logo.png';

export default function Navbar({ currentStep }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#020718]/85 backdrop-blur-2xl border-b border-blue-900/30 shadow-[0_4px_30px_rgba(2,6,18,0.8)]">
      <div className="h-24 max-w-[1240px] mx-auto px-6 flex items-center justify-between gap-4">
        
        {/* Brand & Rotating Tagline */}
        <div className="flex items-center gap-4">
          <a className="flex items-center gap-3.5 group cursor-pointer" href="#">
            <div className="h-14 w-14 flex items-center justify-center">
              <img
                alt="Hypervision Logo"
                className="h-14 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_14px_rgba(56,189,248,0.5)]"
                src={hypervisionLogo}
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-sora font-extrabold text-2xl tracking-wider text-white uppercase">
                  hypervision
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-sky-200/70 tracking-widest uppercase inline-flex items-center gap-1.5 overflow-hidden">
                <span className="relative inline-grid items-center h-5 min-w-[130px]">
                  <span className="tagline-word-1 text-sky-200 absolute left-0">Innovate</span>
                  <span className="tagline-word-2 text-sky-200 absolute left-0">Collaborate</span>
                  <span className="tagline-word-3 text-sky-200 absolute left-0">Elevate</span>
                </span>
              </span>
            </div>
          </a>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-3">
          
          {/* Step indicator badge matching pg2/pg3 */}
          {currentStep === 'payment' && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#05112a]/90 border border-[#38BDF8]/40 text-xs font-mono text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
              <span className="font-semibold tracking-wider uppercase">Step 2 of 2: Registration Payment</span>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#05112a]/90 border border-emerald-500/40 text-xs font-mono text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold tracking-wider uppercase">Registration Verified</span>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
