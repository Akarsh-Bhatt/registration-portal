import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const YEAR_OPTIONS = [
  { id: '1st Year', label: '1st Year' },
  { id: '2nd Year', label: '2nd Year' },
  { id: '3rd Year', label: '3rd Year' },
  { id: '4th Year', label: '4th Year' }
];

const INTEREST_OPTIONS = [
  'Web Development',
  'App Development',
  'AI / Machine Learning',
  'Data Science',
  'Cybersecurity',
  'Cloud & DevOps'
];

export default function RegistrationForm({ onProceedToPayment }) {
  const [formData, setFormData] = useState({
    name: '',
    sapid: '',
    college_email: '',
    phone: '',
    current_year: '1st Year',
    interests: ['Web Development'],
    linkedin: '',
    github: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sapidChecking, setSapidChecking] = useState(false);
  const [sapidAlreadyRegistered, setSapidAlreadyRegistered] = useState(false);

  const toggleInterest = (option) => {
    setFormData(prev => {
      const exists = prev.interests.includes(option);
      let updated;
      if (exists) {
        updated = prev.interests.filter(item => item !== option);
      } else {
        updated = [...prev.interests, option];
      }
      return { ...prev, interests: updated };
    });
    if (errors.interests) {
      setErrors(prev => ({ ...prev, interests: '' }));
    }
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

    // 6. Project Interests
    if (!formData.interests || formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one project interest';
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
      const payload = {
        ...formData,
        interest: formData.interests.join(', '),
        interests: formData.interests
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
          participant: result.participant || payload
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
          <h1 className="font-sora font-extrabold text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight cosmic-text-gradient drop-shadow-[0_0_40px_rgba(37,99,235,0.45)] max-w-4xl text-center">
            Register for Hypervision
          </h1>
          
          <div className="inline-flex items-center gap-3 mt-4 px-4 py-1.5 rounded-full bg-[#06112a]/85 border border-blue-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <span className="text-[#38BDF8] text-xs font-mono drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">✦</span>
            <span className="font-mono text-xs sm:text-[13px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#BAE6FD] via-white to-[#38BDF8] font-medium drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              Begin your Journey
            </span>
            <span className="text-[#38BDF8] text-xs font-mono drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">✦</span>
          </div>
        </section>

        {/* Centered Focal Registration Card from pg1 */}
        <div className="w-full max-w-3xl mx-auto" id="register">
          <div className="glass-card rounded-3xl p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden border border-blue-500/30">
            
            {/* Shimmering Top Accent Border Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0c2356] via-[#1d4ed8] to-[#38bdf8]" />

            {/* Form Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-blue-900/30">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#93c5fd] font-semibold">
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
                        <span className="text-[#38BDF8] font-bold">01.</span> Full Name <span className="text-[#38BDF8]">*</span>
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
                        className={`w-full bg-[#03091e]/90 border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 outline-none transition-all shadow-inner ${
                          errors.name ? 'border-rose-500/80' : 'border-white/15 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/25'
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
                        <span className="text-[#60a5fa] font-bold">02.</span> SAP ID <span className="text-[#38BDF8]">*</span>
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
                        className={`w-full bg-[#03091e]/90 border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 font-mono outline-none transition-all shadow-inner ${
                          errors.sapid || sapidAlreadyRegistered ? 'border-rose-500/80' : 'border-white/15 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/25'
                        }`}
                      />
                      {sapidChecking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
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
                        <span className="text-[#38BDF8] font-bold">03.</span> College Email ID <span className="text-[#38BDF8]">*</span>
                      </label>
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
                        className={`w-full bg-[#03091e]/90 border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 outline-none transition-all shadow-inner ${
                          errors.college_email ? 'border-rose-500/80' : 'border-white/15 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/25'
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
                        <span className="text-[#60a5fa] font-bold">04.</span> Phone Number <span className="text-[#38BDF8]">*</span>
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
                        className={`w-full bg-[#03091e]/90 border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 font-mono outline-none transition-all shadow-inner ${
                          errors.phone ? 'border-rose-500/80' : 'border-white/15 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/25'
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
                      <span className="text-[#38BDF8] font-bold">05.</span> Year of Studying <span className="text-[#38BDF8]">*</span>
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
                              ? 'bg-[#0a1a3f] border-2 border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                              : 'bg-[#050f26]/90 border border-blue-900/30 hover:border-blue-500/30'
                          }`}
                        >
                          <span className={`font-sora text-xs font-semibold ${isSelected ? 'text-[#38BDF8]' : 'text-white'}`}>
                            {year.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Criteria Box 6: Areas of Interest (Button Selection Format) */}
              <div className="cascade-item" style={{ animationDelay: '0.6s' }}>
                <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                      <span className="text-[#60a5fa] font-bold">06.</span> Project Interests <span className="text-[#38BDF8]">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-sky-400/90 font-medium">
                      {formData.interests.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {INTEREST_OPTIONS.map((option) => {
                      const isSelected = formData.interests.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleInterest(option)}
                          className={`flex items-center justify-center p-3.5 rounded-xl cursor-pointer text-center transition-all ${
                            isSelected
                              ? 'bg-[#0a1a3f] border-2 border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                              : 'bg-[#050f26]/90 border border-blue-900/30 hover:border-blue-500/30'
                          }`}
                        >
                          <span className={`font-sora text-xs font-semibold ${isSelected ? 'text-[#38BDF8]' : 'text-gray-200'}`}>
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {errors.interests && (
                    <p className="text-[11px] text-rose-400 font-mono mt-0.5">{errors.interests}</p>
                  )}
                </div>
              </div>

              {/* Criteria Box 7 & 8: LinkedIn & GitHub Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 7. LinkedIn Profile */}
                <div className="cascade-item" style={{ animationDelay: '0.7s' }}>
                  <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                        <span className="text-[#38BDF8] font-bold">07.</span> LinkedIn
                        <span className="text-[10px] text-gray-400 font-normal lowercase">(optional)</span>
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m1.4 9.74v-8.37H5.06v8.37z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-[#03091e]/90 border border-white/15 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/25 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* 8. GitHub Profile */}
                <div className="cascade-item" style={{ animationDelay: '0.8s' }}>
                  <div className="criteria-box rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs uppercase tracking-wider text-gray-300 font-medium flex items-center gap-1.5">
                        <span className="text-[#60a5fa] font-bold">08.</span> GitHub
                        <span className="text-[10px] text-gray-400 font-normal lowercase">(optional)</span>
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full bg-[#03091e]/90 border border-white/15 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-gray-500 outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/25 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Criteria Box 9: Action CTA Button */}
              <div className="cascade-item" style={{ animationDelay: '0.9s' }}>
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
