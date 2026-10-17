import React, { useState } from 'react';

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' }
];

export default function PaymentGateway({ orderData, onCancel, onPaymentComplete }) {
  const [activeMethod, setActiveMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [utrNumber, setUtrNumber] = useState('402918239012');
  const [copiedUpi, setCopiedUpi] = useState(false);
  
  // Card states
  const [cardNumber, setCardNumber] = useState('4532 8912 3019 4410');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');

  // NetBanking state
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Processing state
  const [processing, setProcessing] = useState(false);

  const participant = orderData?.participant || {
    name: 'Aarav Sharma',
    sapid: '590012345',
    college_email: 'aarav.12345@stu.upes.ac.in',
    phone: '9876543210',
    current_year: '2nd Year'
  };

  const uniqueId = orderData?.registration_id || 'HYP-1024';
  const amount = orderData?.amount || 150.0;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText('hypervision.upes@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmTransaction = async (e) => {
    if (e) e.preventDefault();
    setProcessing(true);

    try {
      const randomTxn = utrNumber.trim() || `TXN-UPES-${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: uniqueId,
          order_id: orderData?.order_id || `ORD-${uniqueId}-100`,
          payment_method: activeMethod.toUpperCase(),
          amount: amount,
          transaction_id: randomTxn
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Payment verification failed');
      }

      if (onPaymentComplete) {
        onPaymentComplete(data);
      }
    } catch (err) {
      alert(`Payment Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="w-full pt-32 pb-20 relative z-10">
      <div className="max-w-[1240px] mx-auto px-6 flex flex-col items-center">
        
        {/* Hero Header Section from pg2 */}
        <section className="flex flex-col items-center text-center pt-2 pb-8 max-w-3xl">
          <h1 className="font-sora font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight cosmic-text-gradient drop-shadow-[0_0_40px_rgba(153,0,255,0.4)] max-w-4xl text-center">
            Complete Membership Payment
          </h1>
          <p className="mt-3 text-gray-300 font-outfit text-sm sm:text-base max-w-xl text-center">
            Registration Fee: <span className="text-[#00EEFC] font-semibold font-mono text-lg">₹{amount.toFixed(0)}</span>
          </p>
        </section>

        {/* Centered Focal Registration Card from pg2 */}
        <div className="w-full max-w-5xl mx-auto" id="register">
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden border border-purple-500/30">
            
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6823C3] via-[#007BFF] to-[#00EEFC]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pt-2">
              
              {/* LEFT COLUMN: Payment Method Selection */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#deb7ff] font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#00EEFC]">
                      account_balance_wallet
                    </span>
                    Select Payment Method
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified_user</span>
                    Instant Verification
                  </span>
                </div>

                {/* Method selector tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#0F0C19]/90 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveMethod('upi')}
                    className={`py-2.5 px-3 rounded-xl font-mono text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      activeMethod === 'upi'
                        ? 'bg-gradient-to-r from-purple-900/50 to-cyan-900/40 border border-[#00EEFC]/50 text-white shadow-[0_0_15px_rgba(0,238,252,0.2)]'
                        : 'border border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${activeMethod === 'upi' ? 'text-[#00EEFC]' : ''}`}>
                      qr_code_2
                    </span>
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMethod('card')}
                    className={`py-2.5 px-3 rounded-xl font-mono text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      activeMethod === 'card'
                        ? 'bg-gradient-to-r from-purple-900/50 to-cyan-900/40 border border-[#00EEFC]/50 text-white shadow-[0_0_15px_rgba(0,238,252,0.2)]'
                        : 'border border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${activeMethod === 'card' ? 'text-[#00EEFC]' : ''}`}>
                      credit_card
                    </span>
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMethod('netbanking')}
                    className={`py-2.5 px-3 rounded-xl font-mono text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      activeMethod === 'netbanking'
                        ? 'bg-gradient-to-r from-purple-900/50 to-cyan-900/40 border border-[#00EEFC]/50 text-white shadow-[0_0_15px_rgba(0,238,252,0.2)]'
                        : 'border border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${activeMethod === 'netbanking' ? 'text-[#00EEFC]' : ''}`}>
                      account_balance
                    </span>
                    <span>NetBanking</span>
                  </button>
                </div>

                {/* TAB 1: UPI / QR Payment */}
                {activeMethod === 'upi' && (
                  <div className="criteria-box rounded-2xl p-5 flex flex-col gap-5">
                    
                    {/* QR Code and UPI ID */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#0F0C19]/90 border border-purple-500/30">
                      
                      <div className="w-36 h-36 p-2 rounded-xl bg-white shadow-[0_0_25px_rgba(0,238,252,0.35)] flex flex-col items-center justify-center relative shrink-0">
                        <svg className="w-full h-full text-black" fill="currentColor" viewBox="0 0 100 100">
                          <path d="M5,5 h30 v30 h-30 z M10,10 v20 h20 v-20 z M15,15 h10 v10 h-10 z M65,5 h30 v30 h-30 z M70,10 v20 h20 v-20 z M75,15 h10 v10 h-10 z M5,65 h30 v30 h-30 z M10,70 v20 h20 v-20 z M15,75 h10 v10 h-10 z M42,10 h8 v8 h-8 z M42,24 h8 v14 h-8 z M54,14 h10 v8 h-10 z M10,44 h8 v14 h-8 z M22,44 h14 v6 h-14 z M26,54 h10 v10 h-10 z M44,44 h12 v12 h-12 z M62,44 h8 v8 h-8 z M76,44 h14 v8 h-14 z M60,56 h10 v14 h-10 z M74,56 h18 v8 h-18 z M44,62 h8 v14 h-8 z M56,76 h12 v10 h-12 z M74,74 h8 v16 h-8 z M86,70 h8 v18 h-8 z M42,82 h10 v8 h-10 z" />
                          <circle cx="50" cy="50" fill="#6823C3" r="8" />
                          <circle cx="50" cy="50" fill="#00EEFC" r="4" />
                        </svg>
                        <div className="absolute -bottom-2 bg-[#0A071B] border border-[#00EEFC]/60 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#00EEFC]">
                          ₹{amount.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
                        <div className="text-xs font-mono uppercase tracking-wider text-gray-400">
                          Official Admin UPI Handle
                        </div>
                        <div className="flex items-center gap-2 bg-[#15111F] px-3 py-2 rounded-lg border border-white/10">
                          <code className="font-mono text-xs sm:text-sm text-[#00EEFC] font-semibold flex-1 select-all truncate">
                            hypervision.upes@okhdfcbank
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/40 text-[#deb7ff] font-mono text-[11px] font-bold border border-purple-500/40 transition-colors cursor-pointer"
                          >
                            {copiedUpi ? 'COPIED' : 'COPY'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 font-outfit leading-relaxed">
                          Scan via Google Pay, PhonePe, Paytm, or BHIM. Automatic instant reconciliation.
                        </p>
                      </div>

                    </div>

                    {/* UTR Input Form */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                          <span className="text-[#00EEFC] font-bold">•</span> 12-Digit Transaction / UTR Ref Number <span className="text-[#00EEFC]">*</span>
                        </label>
                        <span className="text-[10px] font-mono text-[#00EEFC] uppercase tracking-wider bg-[#00EEFC]/10 px-2 py-0.5 rounded border border-[#00EEFC]/30">
                          Mandatory
                        </span>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                          tag
                        </span>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 402918239012"
                          className="w-full bg-[#0F0C19]/90 border border-white/15 focus:border-[#00EEFC] focus:ring-2 focus:ring-[#00EEFC]/25 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 font-mono outline-none transition-all shadow-inner"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: Card Payment */}
                {activeMethod === 'card' && (
                  <div className="criteria-box rounded-2xl p-5 flex flex-col gap-4">
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-gray-300 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8912 3019 4410"
                        className="w-full bg-[#0F0C19]/90 border border-white/15 text-white rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#00EEFC]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-mono text-xs uppercase tracking-wider text-gray-300 block mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="08/29"
                          className="w-full bg-[#0F0C19]/90 border border-white/15 text-white rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#00EEFC]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-xs uppercase tracking-wider text-gray-300 block mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="742"
                          maxLength={4}
                          className="w-full bg-[#0F0C19]/90 border border-white/15 text-white rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#00EEFC]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: NetBanking */}
                {activeMethod === 'netbanking' && (
                  <div className="criteria-box rounded-2xl p-5 flex flex-col gap-3">
                    <label className="font-mono text-xs uppercase tracking-wider text-gray-300">
                      Select Bank
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {POPULAR_BANKS.map(bank => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-3 rounded-xl border text-xs font-mono font-medium text-left cursor-pointer transition-all ${
                            selectedBank === bank.id
                              ? 'bg-purple-900/40 border-[#00EEFC] text-[#00EEFC]'
                              : 'bg-[#0F0C19]/90 border-white/10 text-gray-300'
                          }`}
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Registration Review & Submission from pg2 */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="criteria-box rounded-2xl p-5 flex flex-col gap-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#deb7ff] font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#7df4ff]">receipt_long</span>
                      Registration Review
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[#00EEFC] font-mono text-[11px] border border-cyan-500/20">
                      Ready to Pay
                    </span>
                  </div>

                  {/* Review details */}
                  <div className="p-3.5 rounded-xl bg-[#0F0C19]/80 border border-white/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-mono">Unique ID:</span>
                      <span className="text-[#00EEFC] font-mono font-bold tracking-wider">
                        {uniqueId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-mono">Candidate:</span>
                      <span className="text-white font-medium">{participant.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-mono">SAP ID:</span>
                      <span className="text-white font-mono font-semibold">{participant.sapid}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-mono">Year:</span>
                      <span className="text-[#deb7ff] font-semibold">{participant.current_year}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-mono">Tier:</span>
                      <span className="text-[#deb7ff] font-semibold">Member</span>
                    </div>

                    <div className="text-[11px] text-gray-400 pt-1 border-t border-white/5">
                      Technical Events, Astronomy Labs &amp; Flagship Hackathons 2025/26
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between text-sm font-mono pt-2 border-t border-white/10 font-bold">
                      <span className="text-white">Total Payable:</span>
                      <span className="text-[#00EEFC] text-base drop-shadow-[0_0_8px_rgba(0,238,252,0.5)]">
                        ₹{amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Submit CTA button from pg2 */}
                  <button
                    type="button"
                    onClick={handleConfirmTransaction}
                    disabled={processing}
                    className="btn-cosmic-glow w-full py-4 px-6 rounded-xl font-sora font-bold text-sm tracking-wide uppercase text-white flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_25px_rgba(0,238,252,0.4)] mt-1 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Transaction...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-white text-[19px]">verified</span>
                        <span>Confirm &amp; Submit Transaction</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-center font-mono text-xs text-gray-400 hover:text-[#00EEFC] transition-colors py-1 cursor-pointer bg-transparent border-none"
                  >
                    ← Return to Registration Form
                  </button>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
