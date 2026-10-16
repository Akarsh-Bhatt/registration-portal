import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import PaymentGateway from './components/PaymentGateway';
import RegistrationComplete from './components/RegistrationComplete';
import Footer from './components/Footer';
import CosmicShader from './components/CosmicShader';
import AtlasConfigModal from './components/AtlasConfigModal';

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
    <div className="min-h-screen bg-[#0A071B] font-outfit text-[#E7DFF3] antialiased selection:bg-[#9900FF] selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* Interactive WebGL Shader Canvas from pages design */}
      <CosmicShader />

      {/* Persistent Top Navigation Bar from pages design */}
      <Navbar
        currentStep={currentStep}
        atlasStatus={atlasStatus}
        onOpenAtlasModal={() => setIsAtlasModalOpen(true)}
      />

      {/* Step Router: pg1 (Registration) -> pg2 (Payment) -> pg3 (Complete) */}
      <div className="flex-1">
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
