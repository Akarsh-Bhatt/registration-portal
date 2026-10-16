import React from 'react';
import { Sparkles, Database } from 'lucide-react';

export default function Navbar({ atlasStatus, onOpenAtlasModal }) {
  const isAtlasOnline = atlasStatus?.connected_to_atlas;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
              <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-sm -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  NEXUS CLUB
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  UPES Chapter
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Club Participant Registration Portal
              </p>
            </div>
          </div>

          {/* MongoDB Atlas Status Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAtlasModal}
              title="Click to configure MongoDB Atlas Connection"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                isAtlasOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAtlasOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAtlasOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span className="font-mono text-xs">
                {isAtlasOnline ? 'MongoDB Atlas' : 'Atlas Ready'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
