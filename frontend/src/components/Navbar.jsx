import React from 'react';
import { Database } from 'lucide-react';

const HYPERVISION_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuBXpbEmeI7CgRPZXYElnHDRETlCo0Pd2bwbTpXvEzRb6mrikyUy_83Rn8YAhOpmHjiHJ00RpJbSc3NNOBd4LTnGWKZ781fYl5VjWwjQcxKokCit2ey3yFI2ocwsHNGYMSv4IedirFyYRRpjcejE2s84qlrcFCmUGkkOme3NwPd6kRNXvD4adAtARrCRfYOPoEcfhGj57FPDcFQSTvVmZXGIyzyZxmQ6VNMraEmgkDIZlbiGyyQpZHzCzW-9hmCBU0r9rQ";

export default function Navbar({ currentStep, atlasStatus, onOpenAtlasModal }) {
  const isAtlasOnline = atlasStatus?.connected_to_atlas;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0F0C19]/80 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-24 max-w-[1240px] mx-auto px-6 flex items-center justify-between gap-4">
        
        {/* Brand & Rotating Tagline */}
        <div className="flex items-center gap-4">
          <a className="flex items-center gap-3.5 group cursor-pointer" href="#">
            <div className="h-14 w-14 flex items-center justify-center">
              <img
                alt="Hypervision Logo"
                className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
                src={HYPERVISION_LOGO}
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-sora font-extrabold text-2xl tracking-wider text-white uppercase">
                  hypervision
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-[#deb7ff] border border-purple-500/30 font-semibold tracking-wider uppercase hidden sm:inline-block">
                  INNOVATE
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-gray-400 tracking-widest uppercase inline-flex items-center gap-1.5 overflow-hidden">
                <span className="relative inline-grid items-center h-5 min-w-[130px]">
                  <span className="tagline-word-1 text-gray-300 absolute left-0">Innovate</span>
                  <span className="tagline-word-2 text-gray-300 absolute left-0">Collaborate</span>
                  <span className="tagline-word-3 text-gray-300 absolute left-0">Elevate</span>
                </span>
              </span>
            </div>
          </a>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-3">
          
          {/* Step indicator badge matching pg2/pg3 */}
          {currentStep === 'payment' && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#15111F]/90 border border-[#00EEFC]/40 text-xs font-mono text-[#00EEFC] shadow-[0_0_15px_rgba(0,238,252,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#00EEFC] animate-ping" />
              <span className="font-semibold tracking-wider uppercase">Step 2 of 2: Registration Payment</span>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#15111F]/90 border border-emerald-500/40 text-xs font-mono text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold tracking-wider uppercase">Registration Verified</span>
            </div>
          )}

          {/* MongoDB Atlas Pill */}
          <button
            onClick={onOpenAtlasModal}
            title="Configure MongoDB Atlas Connection"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer ${
              isAtlasOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isAtlasOnline ? 'Atlas Online' : 'Atlas Ready'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
