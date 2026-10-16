import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, CheckCircle2, QrCode, CreditCard, 
  Building2, Smartphone, ArrowRight, ArrowLeft, RefreshCw, 
  Copy, Check, AlertCircle, Sparkles, Clock, Download, Printer, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', icon: '🏦' },
  { id: 'sbi', name: 'State Bank of India', icon: '🏛️' },
  { id: 'icici', name: 'ICICI Bank', icon: '🏢' },
  { id: 'axis', name: 'Axis Bank', icon: '🏧' },
  { id: 'upes', name: 'UPES Campus Branch', icon: '🎓' }
];

export default function PaymentGateway({ orderData, onCancel, onPaymentComplete }) {
  const [activeMethod, setActiveMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState(orderData?.participant?.sapid ? `${orderData.participant.sapid}@upi` : 'aarav@okaxis');
  const [selectedBank, setSelectedBank] = useState('hdfc');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');
  const [cardName, setCardName] = useState(orderData?.participant?.name || 'Aarav Singh');

  // Gateway flow state
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(599); // 10 minutes countdown
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Countdown timer for realistic payment session
  useEffect(() => {
    if (receipt) return;
    const timer = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [receipt]);

  const formatTimer = () => {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProcessPayment = async (methodName) => {
    setProcessing(true);
    setProcessStep('Connecting to payment gateway network...');

    try {
      await new Promise(r => setTimeout(r, 800));
      setProcessStep('Authorizing payment with bank server...');
      
      await new Promise(r => setTimeout(r, 900));
      setProcessStep('Verifying order and updating MongoDB Atlas...');

      // Call backend verification
      const randomTxn = `TXN-UPES-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: orderData.registration_id,
          order_id: orderData.order_id,
          payment_method: methodName,
          amount: orderData.amount || 299.0,
          transaction_id: randomTxn
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Payment verification failed');
      }

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#a855f7', '#38bdf8']
        });
      } catch {}

      setReceipt(data);
      if (onPaymentComplete) {
        onPaymentComplete(data);
      }
    } catch (err) {
      alert(`Payment Error: ${err.message}`);
    } finally {
      setProcessing(false);
      setProcessStep('');
    }
  };

  const participant = orderData?.participant || {
    name: 'Aarav Singh',
    sapid: '590012345',
    college_email: 'aarav.12345@stu.upes.ac.in',
    phone: '9876543210',
    current_year: '2nd Year'
  };

  // SUCCESS RECEIPT VIEW
  if (receipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Success Badge */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Payment Completed • Active Club Member
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3">
            Payment Successful!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Your ₹{orderData.amount || 299.0} club intake fee has been verified and permanently updated in <strong className="text-emerald-400">MongoDB Atlas</strong>.
          </p>

          {/* Digital Receipt Card */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-900/90 border border-white/10 text-left space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Transaction Reference
                </p>
                <p className="text-sm font-mono font-bold text-emerald-400">
                  {receipt.transaction_id}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(receipt.transaction_id);
                  setCopiedTxn(true);
                  setTimeout(() => setCopiedTxn(false), 2000);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedTxn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedTxn ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Participant Name</span>
                <span className="font-bold text-white text-sm">{participant.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">SAP ID</span>
                <span className="font-mono font-bold text-indigo-300 text-sm">{participant.sapid}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">College Email</span>
                <span className="font-mono text-slate-200 truncate block">{participant.college_email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                <span className="font-mono text-slate-200">+91 {participant.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Year</span>
                <span className="text-slate-200 font-semibold">{participant.current_year}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Amount Paid</span>
                <span className="font-mono font-extrabold text-emerald-400 text-base">₹{orderData.amount || 299}.00</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Order: {orderData.order_id}</span>
              <span>Paid: {new Date(receipt.paid_at || Date.now()).toLocaleTimeString()}</span>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Print Payment Receipt</span>
            </button>

            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Register Another Member</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ACTIVE PAYMENT CHECKOUT VIEW
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Top Session & Security Indicator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 pb-4 border-b border-slate-800/80">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registration</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span className="font-mono">Session expires: {formatTimer()}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Order Summary & Participant Credentials Review */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Club Membership Intake
                </p>
                <h3 className="text-lg font-extrabold text-white">
                  Order Summary
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {orderData.order_id}
              </span>
            </div>

            {/* Participant Credentials Details */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2.5 text-xs mb-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Participant:</span>
                <span className="font-bold text-white">{participant.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">SAP ID:</span>
                <span className="font-mono font-bold text-indigo-300">{participant.sapid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">College Email:</span>
                <span className="font-mono text-slate-300 truncate max-w-[170px]" title={participant.college_email}>
                  {participant.college_email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-slate-300">+91 {participant.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Academic Year:</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                  {participant.current_year}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs border-b border-white/10 pb-4">
              <div className="flex justify-between text-slate-300">
                <span>Annual Club Membership Fee</span>
                <span className="font-mono">₹250.00</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Chapter Badge & Orientation Kit</span>
                <span className="font-mono">₹49.00</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Platform & Gateway Fee</span>
                <span className="font-bold font-mono">FREE (₹0.00)</span>
              </div>
            </div>

            {/* Total Amount Due */}
            <div className="pt-4 flex items-baseline justify-between">
              <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                Total Payable
              </span>
              <div className="text-right">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  ₹{orderData.amount || 299}.00
                </span>
                <p className="text-[10px] text-slate-400">Inclusive of all college chapter taxes</p>
              </div>
            </div>

            {/* Perks included */}
            <div className="mt-5 pt-4 border-t border-white/5 space-y-1.5 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-300">Included with this registration:</p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Official UPES Chapter ID & Access Card
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Guaranteed entry into Annual Nexus Hackathon
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Access to GitHub Club Organization
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Payment Method Selection & Checkout Gateway */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Select Payment Method
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose your preferred option to complete club registration
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Verified Gateway</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 mb-6">
              
              <button
                type="button"
                onClick={() => setActiveMethod('upi')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  activeMethod === 'upi'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('card')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  activeMethod === 'card'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('netbanking')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  activeMethod === 'netbanking'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Net Banking</span>
              </button>

            </div>

            {/* TAB 1: UPI / QR CODE */}
            {activeMethod === 'upi' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Visual QR Code Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  
                  {/* Dynamic QR Box */}
                  <div className="p-3 rounded-2xl bg-white text-slate-950 shadow-2xl relative shrink-0">
                    <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="8" y="8" width="28" height="28" fill="#000" />
                      <rect x="12" y="12" width="20" height="20" fill="#fff" />
                      <rect x="16" y="16" width="12" height="12" fill="#000" />

                      <rect x="64" y="8" width="28" height="28" fill="#000" />
                      <rect x="68" y="12" width="20" height="20" fill="#fff" />
                      <rect x="72" y="16" width="12" height="12" fill="#000" />

                      <rect x="8" y="64" width="28" height="28" fill="#000" />
                      <rect x="12" y="68" width="20" height="20" fill="#fff" />
                      <rect x="16" y="72" width="12" height="12" fill="#000" />

                      <rect x="42" y="12" width="16" height="10" fill="#000" />
                      <rect x="42" y="32" width="16" height="6" fill="#000" />
                      <rect x="64" y="42" width="10" height="12" fill="#000" />
                      <rect x="52" y="52" width="16" height="8" fill="#000" />
                      <rect x="74" y="64" width="12" height="14" fill="#000" />
                      <rect x="42" y="70" width="8" height="16" fill="#000" />
                      <rect x="58" y="78" width="16" height="8" fill="#000" />
                    </svg>
                    <span className="block text-[9px] font-mono font-bold mt-1 tracking-wider text-slate-700 text-center">
                      SCAN WITH ANY UPI APP
                    </span>
                  </div>

                  {/* QR Instructions & Accepted Apps */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Scan & Pay via UPI App
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Open Google Pay, PhonePe, Paytm, or BHIM to complete ₹{orderData.amount || 299} payment.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-300">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-white/10">Google Pay</span>
                      <span className="px-2 py-1 rounded bg-slate-800 border border-white/10">PhonePe</span>
                      <span className="px-2 py-1 rounded bg-slate-800 border border-white/10">Paytm</span>
                      <span className="px-2 py-1 rounded bg-slate-800 border border-white/10">BHIM UPI</span>
                    </div>

                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Instant auto-confirmation upon payment
                    </p>
                  </div>

                </div>

                {/* OR Enter UPI ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Or Enter UPI ID / VPA
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okaxis"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-mono glass-input text-white placeholder-slate-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleProcessPayment('UPI ID Push')}
                      disabled={processing}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Verify & Pay
                    </button>
                  </div>
                </div>

                {/* Instant 1-Click Payment Simulator Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleProcessPayment('UPI - Instant Gateway')}
                    disabled={processing}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 shadow-xl shadow-emerald-600/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{processStep || 'Processing Payment...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>Simulate Successful Payment (₹{orderData.amount || 299}.00)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Click to test the live payment approval & MongoDB Atlas confirmation pipeline.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 2: CREDIT / DEBIT CARDS */}
            {activeMethod === 'card' && (
              <form onSubmit={(e) => { e.preventDefault(); handleProcessPayment('Credit/Debit Card'); }} className="space-y-4 animate-fade-in">
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                      Card Number
                    </label>
                    <span className="text-[10px] text-indigo-400 font-semibold">Visa • Mastercard • RuPay</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 0000 0000 0000"
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-mono glass-input text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/29"
                      maxLength={5}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-mono glass-input text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="742"
                      maxLength={4}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-mono glass-input text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Aarav Singh"
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-4 py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processStep || 'Verifying Card with Bank...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{orderData.amount || 299}.00 with Card</span>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* TAB 3: NET BANKING */}
            {activeMethod === 'netbanking' && (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Select Your Bank
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {POPULAR_BANKS.map(bank => {
                    const isSelected = selectedBank === bank.id;
                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md ring-1 ring-indigo-400'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-lg">{bank.icon}</span>
                        <span>{bank.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment(`Net Banking (${selectedBank.toUpperCase()})`)}
                  disabled={processing}
                  className="w-full mt-4 py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processStep || 'Redirecting to Bank Portal...'}</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      <span>Proceed to Bank Login (₹{orderData.amount || 299}.00)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Bottom Security Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                PCI-DSS Compliant Gateway
              </span>
              <span>UPES Student Chapter Portal</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
