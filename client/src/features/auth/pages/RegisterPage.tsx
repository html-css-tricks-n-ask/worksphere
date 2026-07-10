import React from 'react';
import RegisterForm from '../components/RegisterForm.js';

/**
 * Orchestrator RegisterPage component.
 * Wrapper displaying corporate registration templates and dynamic blurs.
 */
export const RegisterPage: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-muted/30">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
