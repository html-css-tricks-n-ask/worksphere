import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useLogin } from '../hooks/useLogin.js';
import { Button } from '../../../components/ui/button.js';
import { Input } from '../../../components/ui/input.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';

/**
 * Presentational and operationalLoginForm component.
 * Houses state bounds, validation messages, and triggers authentication hooks.
 */
export const LoginForm: React.FC = () => {
  const { loading, error, register, handleSubmit, errors } = useLogin();

  return (
    <Card className="w-full max-w-md shadow-xl border bg-card/75 backdrop-blur-md">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl vibrant-gradient text-white font-bold text-xl shadow-lg">
            W
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Access WorkSphere</CardTitle>
        <CardDescription>Enter your workplace credentials below to sign in</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg font-medium border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
              Work Email
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="pl-10"
                {...register('email')}
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.email && (
              <p className="text-[10px] font-semibold text-rose-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot?
              </Link>
            </div>
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full vibrant-gradient text-white hover:brightness-110 shadow-lg border-0 mt-2 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-4 border-t pt-4">
          New to WorkSphere?{' '}
          <Link to="/register-company" className="text-primary hover:underline font-semibold">
            Register Organization
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground mt-4">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Secured by Enterprise Single Sign-On (SSO)</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
