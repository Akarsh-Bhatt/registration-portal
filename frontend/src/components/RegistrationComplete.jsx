import React from 'react';
import { Printer, RefreshCw } from 'lucide-react';

export default function RegistrationComplete({ receipt, orderData, onRegisterAnother }) {
  const uniqueId = receipt?.registration_id || orderData?.registration_id || 'HYP-1024';
  const participant = orderData?.participant || {
    name: 'Aarav Sharma',
    sapid: '590012345',
    college_email: 'aarav.12345@stu.upes.ac.in',
    phone: '9876543210',
    current_year: '2nd Year'
  };

  const txnId = receipt?.transaction_id || 'TXN-UPES-402918239012';

  return (
    <main className="w-full pt-32 pb-20 relative z-10">
      <div className="flex flex-col w-full">
        <div className="max-w-[1180px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-10 relative">
          
          {/* Celebration Hero Banner from pg3 */}
          <section className="flex flex-col items-center text-center relative pt-2">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-[#9900ff]/25 via-[#00eefc]/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>

            <div className="text-2xl sm:text-3xl font-sora font-semibold text-[#00EEFC] tracking-wide mt-2">
              Registration complete!!
            </div>
            <div className="text-gray-300 font-outfit text-base sm:text-lg mt-1">
              Welcome to Hypervision
            </div>

            {/* Unique ID Badge */}
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#15111F]/90 border border-[#00EEFC]/40 shadow-[0_0_25px_rgba(0,238,252,0.25)]">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Unique Member ID:</span>
              <span className="font-mono font-black text-xl text-white tracking-widest">
                {uniqueId}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                Bloom Filter Verified
              </span>
            </div>
          </section>

          {/* Membership Confirmation Card from pg3 */}
          <section className="flex flex-col items-center">
            <div className="w-full max-w-2xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#9900ff] via-[#00eefc] to-[#007bff] rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-1000 -z-10" />

              <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-purple-500/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6823C3] via-[#007BFF] to-[#00EEFC]" />

                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-2xl text-[#00EEFC]">badge</span>
                    <div>
                      <h3 className="font-sora font-bold text-lg text-white">Membership Confirmation</h3>
                      <p className="text-xs text-gray-400 font-mono">UPES Student Chapter • 2026</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    STATUS: ACTIVE
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-[#0F0C19]/80 border border-white/10">
                    <span className="text-gray-400 block text-[11px] uppercase">Candidate Name</span>
                    <span className="text-white font-bold text-sm">{participant.name}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0F0C19]/80 border border-white/10">
                    <span className="text-gray-400 block text-[11px] uppercase">SAP ID</span>
                    <span className="text-[#00EEFC] font-bold text-sm">{participant.sapid}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0F0C19]/80 border border-white/10">
                    <span className="text-gray-400 block text-[11px] uppercase">College Email</span>
                    <span className="text-gray-200 truncate block">{participant.college_email}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0F0C19]/80 border border-white/10">
                    <span className="text-gray-400 block text-[11px] uppercase">Phone Number</span>
                    <span className="text-gray-200">+91 {participant.phone}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0F0C19]/80 border border-white/10">
                    <span className="text-gray-400 block text-[11px] uppercase">Academic Year</span>
                    <span className="text-[#deb7ff] font-bold">{participant.current_year}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0F0C19]/80 border border-white/10">
                    <span className="text-gray-400 block text-[11px] uppercase">Transaction Reference</span>
                    <span className="text-emerald-400 font-bold truncate block">{txnId}</span>
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-xl bg-[#0F0C19]/60 border border-white/5 text-[11px] font-outfit text-gray-400 text-center">
                  Your credentials have been securely stored in the <strong className="text-[#00EEFC]">MongoDB Atlas</strong> database. You will receive an orientation invite via WhatsApp.
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#15111F] hover:bg-[#1D1A27] border border-white/15 text-gray-200 text-xs font-mono font-semibold transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#00EEFC]" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    onClick={onRegisterAnother}
                    className="btn-cosmic-glow flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-sora font-bold tracking-wide uppercase transition-all cursor-pointer shadow-[0_0_20px_rgba(0,238,252,0.3)]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Register Another Member</span>
                  </button>
                </div>

              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
