import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// This component handles redirecting /login to homepage with a flag to open the login modal
const LoginRedirect = ({ setShowLoginModal }) => {
  useEffect(() => {
    // Trigger the login modal to open
    if (setShowLoginModal) {
      setShowLoginModal(true);
    }
  }, [setShowLoginModal]);

  // Redirect to homepage
  return <Navigate to="/" replace />;
};

export default LoginRedirect;
