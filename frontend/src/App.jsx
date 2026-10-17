import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import PaymentGateway from './components/PaymentGateway';
import RegistrationComplete from './components/RegistrationComplete';
import Footer from './components/Footer';
import CosmicAnimation from './components/CosmicAnimation';
import AtlasConfigModal from './components/AtlasConfigModal';
import CustomCursor from './components/CustomCursor';

export default function App() {
  const [atlasStatus, setAtlasStatus] = useState(null);
  const [isAtlasModalOpen, setIsAtlasModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState('register'); // 'register' (pg1) | 'payment' (pg2) | 'complete' (pg3)
  const [activeOrder, setActiveOrder] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

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

  const handlePaymentComplete = (receipt) => {
    setPaymentReceipt(receipt);
    setCurrentStep('complete');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterAnother = () => {
    setActiveOrder(null);
    setPaymentReceipt(null);
    setCurrentStep('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-outfit text-[#F1F5F9] antialiased selection:bg-[#1D4ED8] selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* Interactive Cosmic Custom Cursor for Desktop */}
      <CustomCursor />

      {/* Cosmic Background WebGL Animation from pages/animation */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <CosmicAnimation />
      </div>

      {/* Persistent Top Navigation Bar from pages design */}
      <Navbar
        currentStep={currentStep}
        atlasStatus={atlasStatus}
        onOpenAtlasModal={() => setIsAtlasModalOpen(true)}
      />

      {/* Step Router: pg1 (Registration) -> pg2 (Payment) -> pg3 (Complete) */}
      <div className="flex-1 relative z-10">
        {currentStep === 'register' && (
          <RegistrationForm onProceedToPayment={handleProceedToPayment} />
        )}

        {currentStep === 'payment' && activeOrder && (
          <PaymentGateway
            orderData={activeOrder}
            onCancel={() => setCurrentStep('register')}
            onPaymentComplete={handlePaymentComplete}
          />
        )}

        {currentStep === 'complete' && (
          <RegistrationComplete
            receipt={paymentReceipt}
            orderData={activeOrder}
            onRegisterAnother={handleRegisterAnother}
          />
        )}
      </div>

      {/* Persistent Footer from pages design */}
      <Footer onOpenAtlasModal={() => setIsAtlasModalOpen(true)} />

      {/* MongoDB Atlas Modal */}
      <AtlasConfigModal
        isOpen={isAtlasModalOpen}
        onClose={() => setIsAtlasModalOpen(false)}
        atlasStatus={atlasStatus}
        onStatusUpdated={fetchAtlasStatus}
      />

    </div>
  );
}
