 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

/**
 * Orchestrator ForgotPasswordPage component.
 * Executes password recovery link dispatch via custom validation schemas.
 */
export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const emailValue = watch('email');

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(data);
      setSuccess(true);
    } catch (err) {
      setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to submit reset password request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      React.createElement('div', { className: "flex items-center justify-center min-h-screen p-4 bg-muted/30"     ,}
        , React.createElement(Card, { className: "w-full max-w-md shadow-xl text-center"   ,}
          , React.createElement(CardHeader, null
            , React.createElement('div', { className: "flex justify-center mb-4"  ,}
              , React.createElement('div', { className: "flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600"       ,}
                , React.createElement(CheckCircle2, { className: "h-6 w-6" ,} )
              )
            )
            , React.createElement(CardTitle, { className: "text-2xl font-bold" ,}, "Check Your Email"  )
            , React.createElement(CardDescription, null, "We've dispatched instructions to reset your password."

            )
          )
          , React.createElement(CardContent, { className: "space-y-4",}
            , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, "If an account with email "
                   , React.createElement('strong', null, emailValue), " exists, a password reset link has been dispatched."
            )
            , React.createElement(Link, { to: "/login",}
              , React.createElement(Button, { className: "w-full mt-2" ,}, "Back to Login Screen"   )
            )
          )
        )
      )
    );
  }

  return (
    React.createElement('div', { className: "relative flex items-center justify-center min-h-screen p-4 bg-muted/30"      ,}
      , React.createElement('div', { className: "absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"        ,} )
      , React.createElement(Card, { className: "w-full max-w-md shadow-xl border bg-card/75 backdrop-blur-md"     ,}
        , React.createElement(CardHeader, { className: "text-center",}
          , React.createElement(CardTitle, { className: "text-2xl font-bold" ,}, "Recover Password" )
          , React.createElement(CardDescription, null, "We'll dispatch a link to access your space credentials"        )
        )
        , React.createElement(CardContent, null
          , React.createElement('form', { onSubmit: handleSubmit(onSubmit), className: "space-y-4",}
            , error && (
              React.createElement('div', { className: "p-3 text-xs text-destructive bg-destructive/10 rounded-lg font-medium border border-destructive/20"       ,}
                , error
              )
            )

            , React.createElement('div', { className: "space-y-1.5",}
              , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Work Email Address"  )
              , React.createElement('div', { className: "relative",}
                , React.createElement(Input, {
                  type: "email",
                  placeholder: "name@company.com",
                  className: "pl-10",
                  ...register('email'),}
                )
                , React.createElement(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
              )
              , errors.email && (
                React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.email.message)
              )
            )

            , React.createElement(Button, { type: "submit", disabled: loading, className: "w-full vibrant-gradient text-white hover:brightness-110 shadow-lg border-0 gap-2"      ,}
              , loading ? (
                React.createElement(React.Fragment, null
                  , React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  ,} ), " Dispatching Recovery Link..."
                )
              ) : (
                'Request Reset Link'
              )
            )
          )

          , React.createElement('div', { className: "text-center mt-6" ,}
            , React.createElement(Link, { to: "/login", className: "text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"     ,}
              , React.createElement(ArrowLeft, { className: "h-3 w-3" ,} ), " Back to sign in"
            )
          )
        )
      )
    )
  );
};

export default ForgotPasswordPage;
