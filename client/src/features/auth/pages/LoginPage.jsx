import React from 'react';
import LoginForm from '../components/LoginForm';

/**
 * Orchestrator LoginPage component.
 * Wrapper that displays the dynamic background layers and embeds the LoginForm.
 */
export const LoginPage = () => {
  return (
    React.createElement('div', { className: "relative flex items-center justify-center min-h-screen p-4 bg-muted/30"      ,}
      /* Dynamic Background Blurs */
      , React.createElement('div', { className: "absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"        ,} )
      , React.createElement('div', { className: "absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"        ,} )

      , React.createElement(LoginForm, null )
    )
  );
};

export default LoginPage;
