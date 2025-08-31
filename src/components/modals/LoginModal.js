import React, { useEffect } from 'react';
import LoginForm from '../auth/LoginForm';
import { useAuth } from '../../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose, onRegisterClick }) => {
  const { token } = useAuth();
  useEffect(() => {
    if (isOpen && !token) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, token]);
  if (!isOpen || token) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose} />
      <section className="relative z-10 flex flex-col bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden w-full max-w-md mx-auto animate-fadeIn scale-95 transition-transform duration-300">
        <div className="flex flex-col justify-center items-center w-full p-4 sm:p-6 md:p-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome back!</h2>
          <p className="text-gray-600 mb-4 text-center text-xs sm:text-sm md:text-base">Login to continue managing your trades efficiently.</p>
          <LoginForm onRegisterClick={onRegisterClick} />
          <button onClick={onClose} className="mt-6 text-indigo-600 hover:underline text-xs sm:text-sm">&larr; Back to Home</button>
        </div>
      </section>
    </div>
  );
};

export default LoginModal;
