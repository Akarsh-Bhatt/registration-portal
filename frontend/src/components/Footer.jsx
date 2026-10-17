import React from 'react';
import hypervisionLogo from '../assets/logo.png';

export default function Footer({ onOpenAtlasModal }) {
  return (
    <footer className="w-full border-t border-blue-950/70 bg-[#020614]/95 backdrop-blur-xl py-8 static z-20 mt-auto">
      <div className="max-w-[1240px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        
        {/* Brand & University */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img
              alt="Hypervision Logo"
              className="h-9 w-auto object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              src={hypervisionLogo}
            />
            <span className="font-sora font-bold text-sm text-white uppercase tracking-tight">
              hypervision
            </span>
          </div>
          <p className="font-outfit text-xs text-sky-200/60">
            University of Petroleum and Energy Studies
          </p>
        </div>

        {/* Social Links from pages design */}
        <div className="flex items-center gap-4 font-mono text-xs text-gray-400">
          <a
            aria-label="LinkedIn"
            className="w-10 h-10 rounded-xl bg-[#06112a]/80 border border-blue-900/30 flex items-center justify-center text-gray-400 hover:text-[#38BDF8] hover:border-blue-400/50 hover:bg-white/5 transition-all duration-300 shadow-inner group"
            href="https://www.linkedin.com/in/upeshypervision/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m1.4 9.74v-8.37H5.06v8.37z" />
            </svg>
          </a>

          <a
            aria-label="Instagram"
            className="w-10 h-10 rounded-xl bg-[#06112a]/80 border border-blue-900/30 flex items-center justify-center text-gray-400 hover:text-[#60a5fa] hover:border-blue-400/50 hover:bg-white/5 transition-all duration-300 shadow-inner group"
            href="https://www.instagram.com/upeshypervision/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
          </a>

          <a
            aria-label="Email"
            className="w-10 h-10 rounded-xl bg-[#06112a]/80 border border-blue-900/30 flex items-center justify-center text-gray-400 hover:text-[#38BDF8] hover:border-blue-400/50 hover:bg-white/5 transition-all duration-300 shadow-inner group"
            href="mailto:upes.hypervision@stu.upes.ac.in"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
              mail
            </span>
          </a>
        </div>

        {/* Copyright */}
        <div className="font-mono text-xs text-sky-200/40">
          © 2026 Hypervision. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
