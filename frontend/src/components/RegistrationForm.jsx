import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const YEAR_OPTIONS = [
  { id: '1st Year', label: '1st Year' },
  { id: '2nd Year', label: '2nd Year' },
  { id: '3rd Year', label: '3rd Year' },
  { id: '4th Year', label: '4th Year' }
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
        setErrors(prev => ({ ...prev, sapid: `SAPID already registered under ${data.name || 'a member'}` }));
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
      newErrors.name = 'Please enter your full name (minimum 2 characters)';
    }

    // 2. SAPID
    if (!/^\d{9}$/.test(formData.sapid.trim())) {
      newErrors.sapid = 'SAPID must be exactly 9 digits (e.g. 590012345)';
    }

    // 3. College Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.college_email.trim())) {
      newErrors.college_email = 'Please enter a valid email address';
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

      if (onProceedToPayment) {
        onProceedToPayment({
          registration_id: result.registration_id,
          order_id: result.order_id,
          amount: result.amount || 150.0,
          participant: result.participant || formData
        });
      }

    } catch (err) {
      setServerError(err.message || 'Server connection error. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full pt-32 pb-20 relative z-10">
      <div className="max-w-[1240px] mx-auto px-6 flex flex-col items-center">
        
        {/* Hero Header Section from pg1 */}
        <section className="flex flex-col items-center text-center pt-2 pb-8 max-w-3xl">
          <h1 className="font-sora font-extrabold text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight cosmic-text-gradient drop-shadow-[0_0_40px_rgba(153,0,255,0.4)] max-w-4xl text-center">
            Register for Hypervision
          </h1>
          
          <div className="inline-flex items-center gap-3 mt-4 px-4 py-1.5 rounded-full bg-[#15111F]/80 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(153,0,255,0.15)]">
            <span className="text-[#00EEFC] text-xs font-mono drop-shadow-[0_0_8px_rgba(0,238,252,0.6)]">✦</span>
            <span className="font-mono text-xs sm:text-[13px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#deb7ff] via-white to-[#7df4ff] font-medium drop-shadow-[0_0_12px_rgba(0,238,252,0.3)]">
              Begin your Journey
            </span>
            <span className="text-[#deb7ff] text-xs font-mono drop-shadow-[0_0_8px_rgba(222,183,255,0.6)]">✦</span>
          </div>
        </section>

        {/* Centered Focal Registration Card from pg1 */}
        <div className="w-full max-w-3xl mx-auto" id="register">
          <div className="glass-card rounded-3xl p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden border border-purple-500/30">
            
            {/* Shimmering Top Accent Border Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6823C3] via-[#007BFF] to-[#00EEFC]" />

            {/* Form Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#deb7ff] font-semibold">
                  Registration Form
                </span>
              </div>
            </div>

            {serverError && (
              <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Form Content with Cascading & Floating Criteria Boxes */}
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4 sm:gap-5">
              
              {/* Criteria Box 1 & 2: Full Name & SAP ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Full Name */}
                <div className="cascade-item" style={{ animationDelay: '0.1s' }}>
                  <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                        <span className="text-[#7df4ff] font-bold">01.</span> Full Name <span className="text-[#00EEFC]">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        person
                      </span>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Aarav Sharma"
                        className={`w-full bg-[#0F0C19]/90 border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 outline-none transition-all shadow-inner ${
                          errors.name ? 'border-rose-500/80' : 'border-white/15 focus:border-[#00EEFC] focus:ring-2 focus:ring-[#00EEFC]/25'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[11px] text-rose-400 font-mono mt-0.5">{errors.name}</p>
                    )}
                  </div>
                </div>

                {/* 2. SAP ID */}
                <div className="cascade-item" style={{ animationDelay: '0.2s' }}>
                  <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                        <span className="text-[#deb7ff] font-bold">02.</span> SAP ID <span className="text-[#00EEFC]">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-gray-400">
                        {formData.sapid.length}/9
                      </span>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        badge
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={9}
                        value={formData.sapid}
                        onChange={(e) => handleInputChange('sapid', e.target.value)}
                        placeholder="590012345"
                        className={`w-full bg-[#0F0C19]/90 border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 font-mono outline-none transition-all shadow-inner ${
                          errors.sapid || sapidAlreadyRegistered ? 'border-rose-500/80' : 'border-white/15 focus:border-[#00EEFC] focus:ring-2 focus:ring-[#00EEFC]/25'
                        }`}
                      />
                      {sapidChecking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#00EEFC] border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    {errors.sapid && (
                      <p className="text-[11px] text-rose-400 font-mono mt-0.5">{errors.sapid}</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Criteria Box 3 & 4: College Email ID & Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 3. College Email ID */}
                <div className="cascade-item" style={{ animationDelay: '0.3s' }}>
                  <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                        <span className="text-[#adc7ff] font-bold">03.</span> College Email ID <span className="text-[#00EEFC]">*</span>
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
                        className="text-[10px] font-mono text-[#00EEFC] hover:underline"
                      >
                        + @stu.upes.ac.in
                      </button>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        school
                      </span>
                      <input
                        type="email"
                        required
                        value={formData.college_email}
                        onChange={(e) => handleInputChange('college_email', e.target.value)}
                        placeholder="aarav.12345@stu.upes.ac.in"
                        className={`w-full bg-[#0F0C19]/90 border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 outline-none transition-all shadow-inner ${
                          errors.college_email ? 'border-rose-500/80' : 'border-white/15 focus:border-[#00EEFC] focus:ring-2 focus:ring-[#00EEFC]/25'
                        }`}
                      />
                    </div>
                    {errors.college_email && (
                      <p className="text-[11px] text-rose-400 font-mono mt-0.5">{errors.college_email}</p>
                    )}
                  </div>
                </div>

                {/* 4. Phone Number */}
                <div className="cascade-item" style={{ animationDelay: '0.4s' }}>
                  <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                        <span className="text-[#7df4ff] font-bold">04.</span> Phone Number <span className="text-[#00EEFC]">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        call
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="9876543210"
                        className={`w-full bg-[#0F0C19]/90 border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 font-mono outline-none transition-all shadow-inner ${
                          errors.phone ? 'border-rose-500/80' : 'border-white/15 focus:border-[#00EEFC] focus:ring-2 focus:ring-[#00EEFC]/25'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-rose-400 font-mono mt-0.5">{errors.phone}</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Criteria Box 5: Year of Studying */}
              <div className="cascade-item" style={{ animationDelay: '0.5s' }}>
                <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                      <span className="text-[#deb7ff] font-bold">05.</span> Year of Studying <span className="text-[#00EEFC]">*</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {YEAR_OPTIONS.map((year) => {
                      const isSelected = formData.current_year === year.id;
                      return (
                        <button
                          key={year.id}
                          type="button"
                          onClick={() => handleInputChange('current_year', year.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer text-center transition-all ${
                            isSelected
                              ? 'bg-[#1D1A27] border-2 border-[#00EEFC] shadow-[0_0_15px_rgba(0,238,252,0.3)]'
                              : 'bg-[#15111F]/90 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className={`font-sora text-xs font-semibold ${isSelected ? 'text-[#00EEFC]' : 'text-white'}`}>
                            {year.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Criteria Box 6: Action CTA Button */}
              <div className="cascade-item" style={{ animationDelay: '0.6s' }}>
                <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button
                      type="submit"
                      disabled={loading || sapidAlreadyRegistered}
                      className="btn-cosmic-glow w-full sm:flex-1 py-4 px-6 rounded-xl font-sora font-bold text-sm tracking-wide uppercase text-white flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Unique ID & Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Register</span>
                          <span className="material-symbols-outlined text-white text-[18px] group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </form>

          </div>
        </div>

      </div>
    </main>
  );
}
