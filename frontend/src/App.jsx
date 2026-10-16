import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import PaymentGateway from './components/PaymentGateway';
import AtlasConfigModal from './components/AtlasConfigModal';
import { Database } from 'lucide-react';

export default function App() {
  const [atlasStatus, setAtlasStatus] = useState(null);
  const [isAtlasModalOpen, setIsAtlasModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState('register'); // 'register' | 'payment'
  const [activeOrder, setActiveOrder] = useState(null);

  const fetchAtlasStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setAtlasStatus(data);
      }
    } catch (err) {
      console.warn("Backend API not reachable yet:", err);
    }
  };

  useEffect(() => {
    fetchAtlasStatus();
    const interval = setInterval(fetchAtlasStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleProceedToPayment = (orderData) => {
    setActiveOrder(orderData);
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelPayment = () => {
    setCurrentStep('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background radial ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none -z-10" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 blur-[100px] pointer-events-none -z-10" />

      {/* Top Header */}
      <Navbar
        atlasStatus={atlasStatus}
        onOpenAtlasModal={() => setIsAtlasModalOpen(true)}
      />

      {/* Main Flow: Registration Form -> Payment Gateway */}
      <main className="flex-1">
        {currentStep === 'register' && (
          <RegistrationForm onProceedToPayment={handleProceedToPayment} />
        )}

        {currentStep === 'payment' && activeOrder && (
          <PaymentGateway
            orderData={activeOrder}
            onCancel={handleCancelPayment}
            onPaymentComplete={(receipt) => {
              console.log('Payment verified and saved to MongoDB Atlas:', receipt);
            }}
          />
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">NEXUS CLUB • UPES Student Chapter</span>
            <span>© 2026</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> React
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Tailwind CSS
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Python FastAPI
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> MongoDB Atlas
            </span>
          </div>

          <button
            onClick={() => setIsAtlasModalOpen(true)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <Database className="w-3 h-3" />
            <span>MongoDB Atlas Settings</span>
          </button>

        </div>
      </footer>

      {/* Atlas Config Modal */}
      <AtlasConfigModal
        isOpen={isAtlasModalOpen}
        onClose={() => setIsAtlasModalOpen(false)}
        atlasStatus={atlasStatus}
        onStatusUpdated={fetchAtlasStatus}
      />

    </div>
  );
}
