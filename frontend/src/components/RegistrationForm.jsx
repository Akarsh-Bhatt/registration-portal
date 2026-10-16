import React, { useState } from 'react';
import { 
  User, Hash, Mail, Phone, Calendar, 
  Sparkles, CheckCircle2, AlertCircle, ArrowRight, 
  Zap, ShieldCheck, Terminal, RefreshCw, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const YEAR_OPTIONS = [
  { label: '1st Year', sub: 'Freshmen 2026-30' },
  { label: '2nd Year', sub: 'Sophomore 2025-29' },
  { label: '3rd Year', sub: 'Junior 2024-28' },
  { label: '4th Year', sub: 'Senior 2023-27' },
  { label: '5th Year / PG', sub: 'Integrated / Masters' }
];

export default function RegistrationForm({ onProceedToPayment }) {
  const [formData, setFormData] = useState({
    name: '',
    sapid: '',
    college_email: '',
    phone: '',
    current_year: '1st Year'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sapidChecking, setSapidChecking] = useState(false);
  const [sapidAlreadyRegistered, setSapidAlreadyRegistered] = useState(false);
  const [submittedParticipant, setSubmittedParticipant] = useState(null);

  // Quick fill sample data requested by user
  const handleQuickFill = () => {
    setFormData({
      name: 'Aarav Singh',
      sapid: '590012345',
      college_email: 'aarav.12345@stu.upes.ac.in',
      phone: '9876543210',
      current_year: '2nd Year'
    });
    setErrors({});
    setServerError('');
    setSapidAlreadyRegistered(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (serverError) setServerError('');

    if (field === 'sapid') {
      const cleanSapid = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, sapid: cleanSapid }));
      if (cleanSapid.length === 9) {
        checkSapidLive(cleanSapid);
      } else {
        setSapidAlreadyRegistered(false);
      }
    }
  };

  const checkSapidLive = async (sapid) => {
    try {
      setSapidChecking(true);
      const res = await fetch(`/api/check-sapid/${sapid}`);
      const data = await res.json();
      if (data.exists) {
        setSapidAlreadyRegistered(true);
        setErrors(prev => ({ ...prev, sapid: `SAPID already registered under ${data.name || 'a participant'}` }));
      } else {
        setSapidAlreadyRegistered(false);
      }
    } catch {
      // ignore network hiccups
    } finally {
      setSapidChecking(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Name
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter participant full name (e.g. Aarav Singh)';
    }

    // 2. SAPID
    if (!/^\d{9}$/.test(formData.sapid.trim())) {
      newErrors.sapid = 'SAPID must be exactly 9 digits (e.g. 590012345)';
    }

    // 3. College Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.college_email.trim())) {
      newErrors.college_email = 'Please enter a valid college email (e.g. aarav.12345@stu.upes.ac.in)';
    }

    // 4. Phone
    const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    const stripped = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;
    if (!/^[6-9]\d{9}$/.test(stripped)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    // 5. Current Year
    if (!formData.current_year) {
      newErrors.current_year = 'Please select your current year of study';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (sapidAlreadyRegistered) return;

    setLoading(true);
    setServerError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Registration failed. Please check your details.');
      }

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 110,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981']
        });
      } catch {}

      // Call payment gateway transition
      if (onProceedToPayment) {
        onProceedToPayment({
          registration_id: result.registration_id,
          order_id: result.order_id,
          amount: result.amount || 299.0,
          participant: result.participant || formData
        });
      } else {
        setSubmittedParticipant(result.participant || formData);
      }

    } catch (err) {
      setServerError(err.message || 'Server connection error. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setSubmittedParticipant(null);
    setFormData({
      name: '',
      sapid: '',
      college_email: '',
      phone: '',
      current_year: '1st Year'
    });
    setErrors({});
    setServerError('');
    setSapidAlreadyRegistered(false);
  };

  // If already successfully submitted, show the clean success confirmation
  if (submittedParticipant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Check className="w-3.5 h-3.5" />
            Registration Confirmed
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to the Club!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Participant details have been stored in the online <strong className="text-emerald-400 font-semibold">MongoDB Atlas</strong> database.
          </p>

          {/* Participant Summary Card */}
          <div className="mt-8 p-5 rounded-2xl bg-slate-900/80 border border-white/10 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Participant Name</span>
              <span className="text-sm font-bold text-white">{submittedParticipant.name}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-slate-400 uppercase font-semibold">SAP ID</span>
              <span className="text-sm font-mono font-bold text-indigo-300">{submittedParticipant.sapid}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-slate-400 uppercase font-semibold">College Email</span>
              <span className="text-xs font-mono font-semibold text-slate-200">{submittedParticipant.college_email}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-slate-400 uppercase font-semibold">Phone Number</span>
              <span className="text-xs font-mono font-semibold text-slate-200">+91 {submittedParticipant.phone}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase font-semibold">Current Year</span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {submittedParticipant.current_year}
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-8">
            <button
              onClick={handleRegisterAnother}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Register Another Participant</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Top Banner & Quick Fill Helper */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          Member Intake • 2026-27
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Club Registration Form
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
          Fill in the participant details below to register for the club. Data is validated and stored directly into MongoDB Atlas.
        </p>

        {/* Demo Quick-Fill Button */}
        <div className="mt-5 flex items-center justify-center">
          <button
            type="button"
            onClick={handleQuickFill}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/30 text-indigo-300 transition-all shadow-sm hover:border-indigo-400 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>⚡ Fill Sample (Aarav Singh • 590012345)</span>
          </button>
        </div>
      </div>

      {/* Main Glassmorphic Form Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Registration Error</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

          {/* 1. Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Name <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                id="participant-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Aarav Singh"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium glass-input text-white placeholder-slate-500 outline-none ${
                  errors.name ? 'border-rose-500/80 bg-rose-500/5' : ''
                }`}
              />
              {formData.name.trim().length >= 2 && !errors.name && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
            {errors.name && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          {/* 2. SAPID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                SAPID <span className="text-pink-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.sapid.length}/9 digits
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                id="participant-sapid"
                value={formData.sapid}
                onChange={(e) => handleInputChange('sapid', e.target.value)}
                placeholder="e.g. 590012345"
                maxLength={9}
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono tracking-wider glass-input text-white placeholder-slate-500 outline-none ${
                  errors.sapid || sapidAlreadyRegistered ? 'border-rose-500/80 bg-rose-500/5' : ''
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                {sapidChecking && (
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                )}
                {!sapidChecking && formData.sapid.length === 9 && !errors.sapid && !sapidAlreadyRegistered && (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
            {errors.sapid && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.sapid}
              </p>
            )}
            {!errors.sapid && (
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your 9-digit SAPID (e.g. 590012345).
              </p>
            )}
          </div>

          {/* 3. College Email */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                College Email <span className="text-pink-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  if (formData.college_email && !formData.college_email.includes('@')) {
                    handleInputChange('college_email', `${formData.college_email}@stu.upes.ac.in`);
                  } else if (!formData.college_email) {
                    handleInputChange('college_email', 'aarav.12345@stu.upes.ac.in');
                  }
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-mono cursor-pointer"
              >
                + @stu.upes.ac.in
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                id="participant-email"
                value={formData.college_email}
                onChange={(e) => handleInputChange('college_email', e.target.value)}
                placeholder="e.g. aarav.12345@stu.upes.ac.in"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium glass-input text-white placeholder-slate-500 outline-none ${
                  errors.college_email ? 'border-rose-500/80 bg-rose-500/5' : ''
                }`}
              />
              {formData.college_email.includes('@') && !errors.college_email && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
            {errors.college_email && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.college_email}
              </p>
            )}
          </div>

          {/* 4. Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              Phone Number <span className="text-pink-500">*</span>
            </label>
            <div className="relative flex">
              <div className="flex items-center px-3 rounded-l-xl bg-slate-900 border border-r-0 border-white/10 text-xs font-semibold text-slate-400 select-none">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                required
                id="participant-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className={`w-full pl-3 pr-4 py-3 rounded-r-xl text-sm font-mono tracking-wider glass-input text-white placeholder-slate-500 outline-none ${
                  errors.phone ? 'border-rose-500/80 bg-rose-500/5' : ''
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
              </p>
            )}
          </div>

          {/* 5. Current Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
              Current Year <span className="text-pink-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {YEAR_OPTIONS.map((y) => {
                const isSelected = formData.current_year === y.label;
                return (
                  <button
                    key={y.label}
                    type="button"
                    onClick={() => handleInputChange('current_year', y.label)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {y.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500">{y.sub}</p>
                  </button>
                );
              })}
            </div>
            {errors.current_year && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.current_year}
              </p>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Direct persistence to MongoDB Atlas</span>
            </div>

            <button
              type="submit"
              disabled={loading || sapidAlreadyRegistered}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                loading || sapidAlreadyRegistered
                  ? 'bg-slate-800 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials & Creating Order...</span>
                </>
              ) : (
                <>
                  <span>Submit & Proceed to Payment</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-mono font-bold">₹299</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
