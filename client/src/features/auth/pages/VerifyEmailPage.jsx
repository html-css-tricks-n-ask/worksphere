 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

/**
 * Orchestrator VerifyEmailPage component.
 * Performs verification on component mount using search parameter validation.
 */
export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setError('Verification token is missing.');
        setLoading(false);
        return;
      }
      try {
        await authService.verifyEmail(token);
        setSuccess(true);
      } catch (err) {
        setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Verification failed. The token may be expired.');
      } finally {
        setLoading(false);
      }
    };

    triggerVerification();
  }, [token]);

  return (
    React.createElement('div', { className: "flex items-center justify-center min-h-screen p-4 bg-muted/30"     ,}
      , React.createElement(Card, { className: "w-full max-w-md shadow-xl text-center border"    ,}
        , React.createElement(CardHeader, null
          , React.createElement('div', { className: "flex justify-center mb-4"  ,}
            , loading && (
              React.createElement('div', { className: "flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"       ,}
                , React.createElement(Loader2, { className: "h-6 w-6 animate-spin"  ,} )
              )
            )
            , !loading && success && (
              React.createElement('div', { className: "flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 animate-bounce"        ,}
                , React.createElement(ShieldCheck, { className: "h-6 w-6" ,} )
              )
            )
            , !loading && error && (
              React.createElement('div', { className: "flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive"       ,}
                , React.createElement(ShieldAlert, { className: "h-6 w-6" ,} )
              )
            )
          )
          , React.createElement(CardTitle, { className: "text-2xl font-bold" ,}
            , loading ? 'Verifying Account' : success ? 'Verify Success!' : 'Verification Failed'
          )
          , React.createElement(CardDescription, null
            , loading ? 'Validating your security parameters...' : success ? 'Your email is validated.' : error
          )
        )
        , React.createElement(CardContent, null
          , !loading && (
            React.createElement(Link, { to: "/login",}
              , React.createElement(Button, { className: "w-full mt-2" ,}
                , success ? 'Proceed to Sign In' : 'Back to Login Screen'
              )
            )
          )
        )
      )
    )
  );
};

export default VerifyEmailPage;
