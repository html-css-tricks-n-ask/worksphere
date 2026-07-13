import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Building, Phone, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { useRegister } from '../hooks/useRegister';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

/**
 * Presentational and operational RegisterForm component.
 * Decouples fields validations, dropdown selectors, and loading feedback.
 */
export const RegisterForm = () => {
  const { loading, error, success, register, handleSubmit, errors } = useRegister();

  if (success) {
    return (
      React.createElement(Card, { className: "w-full max-w-md shadow-xl text-center"   ,}
        , React.createElement(CardHeader, null
          , React.createElement('div', { className: "flex justify-center mb-4"  ,}
            , React.createElement('div', { className: "flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 animate-bounce"        ,}
              , React.createElement(ShieldCheck, { className: "h-6 w-6" ,} )
            )
          )
          , React.createElement(CardTitle, { className: "text-2xl font-bold" ,}, "Registration Initiated!" )
          , React.createElement(CardDescription, null, "We've dispatched a validation email to confirm your account credentials."

          )
        )
        , React.createElement(CardContent, { className: "space-y-4",}
          , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, "Please check your inbox (and spam folder) for a verification link to activate your administrator dashboard."

          )
          , React.createElement(Link, { to: "/login",}
            , React.createElement(Button, { className: "w-full mt-2" ,}, "Go to Login Screen"   )
          )
        )
      )
    );
  }

  return (
    React.createElement(Card, { className: "w-full max-w-2xl shadow-xl border bg-card/75 backdrop-blur-md"     ,}
      , React.createElement(CardHeader, { className: "text-center pb-4" ,}
        , React.createElement('div', { className: "flex justify-center mb-3"  ,}
          , React.createElement('div', { className: "flex items-center justify-center w-10 h-10 rounded-xl vibrant-gradient text-white font-bold text-lg shadow-lg"          ,}, "W"

          )
        )
        , React.createElement(CardTitle, { className: "text-xl font-bold tracking-tight"  ,}, "Register Organization" )
        , React.createElement(CardDescription, null, "Launch your dedicated multi-tenant HR workspace"     )
      )

      , React.createElement(CardContent, null
        , React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6",}
          , error && (
            React.createElement('div', { className: "p-3 text-xs text-destructive bg-destructive/10 rounded-lg font-medium border border-destructive/20"       ,}
              , error
            )
          )

          /* Section 1: Company Profile */
          , React.createElement('div', { className: "space-y-4",}
            , React.createElement('h3', { className: "text-xs font-bold uppercase tracking-wider text-primary border-b pb-1"      ,}, "1. Corporate Profile"

            )
            , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4"   ,}
              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "companyName",}, "Company Name"

                )
                , React.createElement('div', { className: "relative",}
                  , React.createElement(Input, {
                    id: "companyName",
                    placeholder: "Acme Corp" ,
                    className: "pl-10",
                    ...register('companyName'),}
                  )
                  , React.createElement(Building, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                )
                , errors.companyName && (
                  React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.companyName.message)
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "companyEmail",}, "Company Email"

                )
                , React.createElement('div', { className: "relative",}
                  , React.createElement(Input, {
                    id: "companyEmail",
                    type: "email",
                    placeholder: "hr@acme.com",
                    className: "pl-10",
                    ...register('companyEmail'),}
                  )
                  , React.createElement(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                )
                , errors.companyEmail && (
                  React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.companyEmail.message)
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "companyPhone",}, "Corporate Phone"

                )
                , React.createElement('div', { className: "relative",}
                  , React.createElement(Input, {
                    id: "companyPhone",
                    placeholder: "+1 (555) 000-0000"  ,
                    className: "pl-10",
                    ...register('companyPhone'),}
                  )
                  , React.createElement(Phone, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "website",}, "Website URL"

                )
                , React.createElement('div', { className: "relative",}
                  , React.createElement(Input, {
                    id: "website",
                    placeholder: "https://acme.com",
                    className: "pl-10",
                    ...register('website'),}
                  )
                  , React.createElement(Globe, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                )
                , errors.website && (
                  React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.website.message)
                )
              )
            )
          )

          /* Section 2: Admin Profile */
          , React.createElement('div', { className: "space-y-4",}
            , React.createElement('h3', { className: "text-xs font-bold uppercase tracking-wider text-primary border-b pb-1"      ,}, "2. System Administrator Details"

            )
            , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4"   ,}
              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "adminFirstName",}, "First Name"

                )
                , React.createElement(Input, {
                  id: "adminFirstName",
                  placeholder: "Jane",
                  ...register('adminFirstName'),}
                )
                , errors.adminFirstName && (
                  React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.adminFirstName.message)
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "adminLastName",}, "Last Name"

                )
                , React.createElement(Input, {
                  id: "adminLastName",
                  placeholder: "Doe",
                  ...register('adminLastName'),}
                )
                , errors.adminLastName && (
                  React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.adminLastName.message)
                )
              )

              , React.createElement('div', { className: "space-y-1.5 sm:col-span-2" ,}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "adminEmail",}, "Administrator Email"

                )
                , React.createElement('div', { className: "relative",}
                  , React.createElement(Input, {
                    id: "adminEmail",
                    type: "email",
                    placeholder: "admin@acme.com",
                    className: "pl-10",
                    ...register('adminEmail'),}
                  )
                  , React.createElement(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                )
                , errors.adminEmail && (
                  React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.adminEmail.message)
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "password",}, "Password"

                )
                , React.createElement('div', { className: "relative",}
                  , React.createElement(Input, {
                    id: "password",
                    type: "password",
                    placeholder: "••••••••",
                    className: "pl-10",
                    ...register('password'),}
                  )
                  , React.createElement(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                )
                , errors.password && (
                  React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.password.message)
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  , htmlFor: "confirmPassword",}, "Confirm Password"

                )
                , React.createElement('div', { className: "relative",}
                  , React.createElement(Input, {
                    id: "confirmPassword",
                    type: "password",
                    placeholder: "••••••••",
                    className: "pl-10",
                    ...register('confirmPassword'),}
                  )
                  , React.createElement(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                )
                , errors.confirmPassword && (
                  React.createElement('p', { className: "text-[10px] font-semibold text-rose-500"  ,}, errors.confirmPassword.message)
                )
              )
            )
          )

          , React.createElement('div', { className: "flex items-center gap-2"  ,}
            , React.createElement('input', {
              type: "checkbox",
              id: "acceptTerms",
              className: "rounded text-primary border-border"  ,
              ...register('acceptTerms'),}
            )
            , React.createElement('label', { htmlFor: "acceptTerms", className: "text-xs text-muted-foreground cursor-pointer"  ,}, "I agree to the corporate software terms of service and usage privacy policy."

            )
          )
          , errors.acceptTerms && (
            React.createElement('p', { className: "text-[10px] font-semibold text-rose-500 mt-1"   ,}, errors.acceptTerms.message)
          )

          , React.createElement(Button, {
            type: "submit",
            disabled: loading,
            className: "w-full vibrant-gradient text-white hover:brightness-110 shadow-lg border-0 gap-2"      ,}

            , loading ? (
              React.createElement(React.Fragment, null
                , React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  ,} ), " Provisioning Workspace..."
              )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('span', null, "Register Workplace" )
                , React.createElement(ArrowRight, { size: 14,} )
              )
            )
          )
        )

        , React.createElement('div', { className: "text-center text-xs text-muted-foreground mt-4 border-t pt-4"     ,}, "Already registered?"
           , ' '
          , React.createElement(Link, { to: "/login", className: "text-primary hover:underline font-semibold"  ,}, "Sign In here"

          )
        )
      )
    )
  );
};

export default RegisterForm;
