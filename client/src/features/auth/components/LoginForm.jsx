import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

/**
 * Presentational and operationalLoginForm component.
 * Houses state bounds, validation messages, and triggers authentication hooks.
 */
export const LoginForm = () => {
  const { loading, error, register, handleSubmit, errors } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    React.createElement(Card, { className: "w-full max-w-md shadow-xl border bg-card/75 backdrop-blur-md"     ,}
      , React.createElement(CardHeader, { className: "text-center pb-4" ,}
        , React.createElement('div', { className: "flex justify-center mb-4"  ,}
          , React.createElement('div', { className: "flex items-center justify-center w-12 h-12 rounded-xl vibrant-gradient text-white font-bold text-xl shadow-lg"          ,}, "W"

          )
        )
        , React.createElement(CardTitle, { className: "text-2xl font-bold tracking-tight"  ,}, "Access WorkSphere" )
        , React.createElement(CardDescription, null, "Enter your workplace credentials below to sign in"       )
      )

      , React.createElement(CardContent, null
        , React.createElement('form', { onSubmit: handleSubmit, className: "space-y-4",}
          , error && (
            React.createElement('div', { className: "p-3 text-xs text-destructive bg-destructive/10 rounded-lg font-medium border border-destructive/20"       ,}
              , error
            )
          )

          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "email",}, "Work Email"

            )
            , React.createElement('div', { className: "relative",}
              , React.createElement(Input, {
                id: "email",
                type: "email",
                placeholder: "name@company.com",
                className: "pl-10",
                autoComplete: "email",
                autoCapitalize: "none",
                autoCorrect: "off",
                spellCheck: "false",
                ...register('email'),}
              )
              , React.createElement(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
            )
            , errors.email && (
              React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.email.message)
            )
          )

          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('div', { className: "flex items-center justify-between"  ,}
              , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "password",}, "Password"

              )
              , React.createElement(Link, { to: "/forgot-password", className: "text-xs text-primary hover:underline"  ,}, "Forgot?"

              )
            )
            , React.createElement('div', { className: "relative",}
              , React.createElement(Input, {
                id: "password",
                type: showPassword ? 'text' : 'password',
                placeholder: "••••••••",
                className: "pl-10 pr-10" ,
                autoComplete: "current-password",
                autoCapitalize: "none",
                autoCorrect: "off",
                spellCheck: "false",
                ...register('password'),}
              )
              , React.createElement(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
              , React.createElement('button', {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute right-3 top-3 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"      ,
                title: showPassword ? "Hide password" : "Show password",}

                , showPassword ? React.createElement(EyeOff, { className: "h-4 w-4" ,} ) : React.createElement(Eye, { className: "h-4 w-4" ,} )
              )
            )
            , errors.password && (
              React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.password.message)
            )
          )

          , React.createElement(Button, {
            type: "submit",
            disabled: loading,
            className: "w-full vibrant-gradient text-white hover:brightness-110 shadow-lg border-0 mt-2 gap-2"       ,}

            , loading ? (
              React.createElement(React.Fragment, null
                , React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  ,} ), " Authenticating..."
              )
            ) : (
              'Sign In'
            )
          )
        )

        , React.createElement('div', { className: "text-center text-xs text-muted-foreground mt-4 border-t pt-4"     ,}, "New to WorkSphere?"
            , ' '
          , React.createElement(Link, { to: "/register-company", className: "text-primary hover:underline font-semibold"  ,}, "Register Organization"

          )
        )

        , React.createElement('div', { className: "flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground mt-4"      ,}
          , React.createElement(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-500"  ,} )
          , React.createElement('span', null, "Secured by Enterprise Single Sign-On (SSO)"     )
        )
      )
    )
  );
};

export default LoginForm;
