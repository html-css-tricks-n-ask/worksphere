import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Building, Phone, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { useRegister } from '../hooks/useRegister.js';
import { Button } from '../../../components/ui/button.js';
import { Input } from '../../../components/ui/input.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';

/**
 * Presentational and operational RegisterForm component.
 * Decouples fields validations, dropdown selectors, and loading feedback.
 */
export const RegisterForm: React.FC = () => {
  const { loading, error, success, register, handleSubmit, errors } = useRegister();

  if (success) {
    return (
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Registration Initiated!</CardTitle>
          <CardDescription>
            We've dispatched a validation email to confirm your account credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please check your inbox (and spam folder) for a verification link to activate your administrator dashboard.
          </p>
          <Link to="/login">
            <Button className="w-full mt-2">Go to Login Screen</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl border bg-card/75 backdrop-blur-md">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl vibrant-gradient text-white font-bold text-lg shadow-lg">
            W
          </div>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Register Organization</CardTitle>
        <CardDescription>Launch your dedicated multi-tenant HR workspace</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg font-medium border border-destructive/20">
              {error}
            </div>
          )}

          {/* Section 1: Company Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">
              1. Corporate Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="companyName">
                  Company Name
                </label>
                <div className="relative">
                  <Input
                    id="companyName"
                    placeholder="Acme Corp"
                    className="pl-10"
                    {...register('companyName')}
                  />
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.companyName && (
                  <p className="text-[10px] font-semibold text-rose-500">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="companyEmail">
                  Company Email
                </label>
                <div className="relative">
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="hr@acme.com"
                    className="pl-10"
                    {...register('companyEmail')}
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.companyEmail && (
                  <p className="text-[10px] font-semibold text-rose-500">{errors.companyEmail.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="companyPhone">
                  Corporate Phone
                </label>
                <div className="relative">
                  <Input
                    id="companyPhone"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                    {...register('companyPhone')}
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="website">
                  Website URL
                </label>
                <div className="relative">
                  <Input
                    id="website"
                    placeholder="https://acme.com"
                    className="pl-10"
                    {...register('website')}
                  />
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.website && (
                  <p className="text-[10px] font-semibold text-rose-500">{errors.website.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Admin Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-1">
              2. System Administrator Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="adminFirstName">
                  First Name
                </label>
                <Input
                  id="adminFirstName"
                  placeholder="Jane"
                  {...register('adminFirstName')}
                />
                {errors.adminFirstName && (
                  <p className="text-[10px] font-semibold text-rose-500">{errors.adminFirstName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="adminLastName">
                  Last Name
                </label>
                <Input
                  id="adminLastName"
                  placeholder="Doe"
                  {...register('adminLastName')}
                />
                {errors.adminLastName && (
                  <p className="text-[10px] font-semibold text-rose-500">{errors.adminLastName.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="adminEmail">
                  Administrator Email
                </label>
                <div className="relative">
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@acme.com"
                    className="pl-10"
                    {...register('adminEmail')}
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.adminEmail && (
                  <p className="text-[10px] font-semibold text-rose-500">{errors.adminEmail.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register('password')}
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.password && (
                  <p className="text-[10px] font-semibold text-rose-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register('confirmPassword')}
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] font-semibold text-rose-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="acceptTerms"
              className="rounded text-primary border-border"
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="text-xs text-muted-foreground cursor-pointer">
              I agree to the corporate software terms of service and usage privacy policy.
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-[10px] font-semibold text-rose-500 mt-1">{errors.acceptTerms.message}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full vibrant-gradient text-white hover:brightness-110 shadow-lg border-0 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Provisioning Workspace...
              </>
            ) : (
              <>
                <span>Register Workplace</span>
                <ArrowRight size={14} />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-4 border-t pt-4">
          Already registered?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign In here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
