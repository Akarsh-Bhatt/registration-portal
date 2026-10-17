import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function RegistrationComplete({ receipt, orderData, onRegisterAnother }) {
  const uniqueId = receipt?.registration_id || receipt?.participant?.registration_id || orderData?.registration_id || 'HYPE0000';
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
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-[#1d4ed8]/30 via-[#38bdf8]/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>

            <div className="text-2xl sm:text-3xl font-sora font-semibold text-[#38BDF8] tracking-wide mt-2">
              Registration complete!!
            </div>
            <div className="text-gray-300 font-outfit text-base sm:text-lg mt-1">
              Welcome to Hypervision
            </div>

            {/* Unique ID Badge */}
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#06112a]/90 border border-[#38BDF8]/40 shadow-[0_0_25px_rgba(56,189,248,0.3)]">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Unique Member ID:</span>
              <span className="font-mono font-black text-xl text-white tracking-widest">
                {uniqueId}
              </span>
            </div>
          </section>

          {/* Membership Confirmation Card from pg3 */}
          <section className="flex flex-col items-center">
            <div className="w-full max-w-2xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0c2356] via-[#1d4ed8] to-[#38bdf8] rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-1000 -z-10" />

              <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-blue-500/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0c2356] via-[#1d4ed8] to-[#38bdf8]" />

                <div className="flex items-center justify-between pb-4 border-b border-blue-900/30">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-2xl text-[#38BDF8]">badge</span>
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
                  <div className="p-3.5 rounded-xl bg-[#03091e]/85 border border-blue-950/50">
                    <span className="text-gray-400 block text-[11px] uppercase">Candidate Name</span>
                    <span className="text-white font-bold text-sm">{participant.name}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#03091e]/85 border border-blue-950/50">
                    <span className="text-gray-400 block text-[11px] uppercase">SAP ID</span>
                    <span className="text-[#38BDF8] font-bold text-sm">{participant.sapid}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#03091e]/85 border border-blue-950/50">
                    <span className="text-gray-400 block text-[11px] uppercase">College Email</span>
                    <span className="text-gray-200 truncate block">{participant.college_email}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#03091e]/85 border border-blue-950/50">
                    <span className="text-gray-400 block text-[11px] uppercase">Phone Number</span>
                    <span className="text-gray-200">+91 {participant.phone}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#03091e]/85 border border-blue-950/50">
                    <span className="text-gray-400 block text-[11px] uppercase">Academic Year</span>
                    <span className="text-[#93c5fd] font-bold">{participant.current_year}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#03091e]/85 border border-blue-950/50">
                    <span className="text-gray-400 block text-[11px] uppercase">Transaction Reference</span>
                    <span className="text-emerald-400 font-bold truncate block">{txnId}</span>
                  </div>

                  {(participant.interest || participant.domain_interest || participant.interests) && (
                    <div className="p-3.5 rounded-xl bg-[#03091e]/85 border border-blue-950/50 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-gray-400 block text-[11px] uppercase mb-1.5">Project Interests</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(participant.interests) 
                            ? participant.interests 
                            : String(participant.interest || participant.domain_interest || '').split(',').map(s => s.trim()).filter(Boolean)
                          ).map(item => (
                            <span key={item} className="px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-[#38BDF8] text-xs font-semibold">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      {(participant.linkedin || participant.github) && (
                        <div className="flex items-center gap-2 pt-1 sm:pt-0">
                          {participant.linkedin && (
                            <a
                              href={participant.linkedin.startsWith('http') ? participant.linkedin : `https://${participant.linkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sky-300 hover:text-white hover:bg-blue-500/20 text-[11px] flex items-center gap-1.5 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m1.4 9.74v-8.37H5.06v8.37z" />
                              </svg>
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {participant.github && (
                            <a
                              href={participant.github.startsWith('http') ? participant.github : `https://${participant.github}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sky-300 hover:text-white hover:bg-blue-500/20 text-[11px] flex items-center gap-1.5 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                              </svg>
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={onRegisterAnother}
                    className="btn-cosmic-glow flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-sora font-bold tracking-wide uppercase transition-all cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.35)]"
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
