import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ShieldCheck, Mail, Lock, Building, Phone, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { Dropdown } from '../components/ui/dropdown.js';

const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  companyEmail: z.string().email('Invalid company email.'),
  companyPhone: z.string().optional(),
  website: z.string().url('Invalid website URL.').optional().or(z.literal('')),
  companySize: z.string().optional(),
  adminFirstName: z.string().min(1, 'First name is required.'),
  adminLastName: z.string().min(1, 'Last name is required.'),
  adminEmail: z.string().email('Invalid email.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Must contain at least one number.')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character.'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms.' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormInput = z.infer<typeof registerSchema>;

export const RegisterCompany: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>();

  const onSubmit = async (data: RegisterFormInput) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post('/auth/register', {
        company: {
          name: data.companyName,
          email: data.companyEmail,
          phone: data.companyPhone,
          website: data.website,
          companySize: data.companySize,
        },
        admin: {
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          email: data.adminEmail,
          password: data.password,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
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
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-muted/30">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-2xl shadow-xl border bg-card/75 backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Onboard Your Organization</CardTitle>
          <CardDescription>Get started with WorkSphere Employee SaaS</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg font-medium border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b pb-1 text-primary">Company Details</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                  <div className="relative">
                    <Input placeholder="Acme Corp" className="pl-10" {...register('companyName', { required: true })} />
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.companyName && <p className="text-[10px] text-destructive">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Company Email</label>
                  <div className="relative">
                    <Input type="email" placeholder="contact@acme.com" className="pl-10" {...register('companyEmail', { required: true })} />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.companyEmail && <p className="text-[10px] text-destructive">{errors.companyEmail.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Company Phone</label>
                  <div className="relative">
                    <Input placeholder="+1 (555) 123-4567" className="pl-10" {...register('companyPhone')} />
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Dropdown
                      label="Company Size"
                      options={[
                        { value: '1-10', label: '1-10' },
                        { value: '11-50', label: '11-50' },
                        { value: '51-200', label: '51-200' },
                        { value: '201-500', label: '201-500' },
                        { value: '500+', label: '500+' },
                      ]}
                      {...register('companySize')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Website</label>
                    <div className="relative">
                      <Input placeholder="https://acme.com" className="pl-10 text-xs" {...register('website')} />
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b pb-1 text-primary">Administrator Settings</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                    <Input placeholder="Jane" {...register('adminFirstName', { required: true })} />
                    {errors.adminFirstName && <p className="text-[10px] text-destructive">{errors.adminFirstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                    <Input placeholder="Doe" {...register('adminLastName', { required: true })} />
                    {errors.adminLastName && <p className="text-[10px] text-destructive">{errors.adminLastName.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Admin Email</label>
                  <div className="relative">
                    <Input type="email" placeholder="admin@acme.com" className="pl-10" {...register('adminEmail', { required: true })} />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.adminEmail && <p className="text-[10px] text-destructive">{errors.adminEmail.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Admin Password</label>
                  <div className="relative">
                    <Input type="password" placeholder="••••••••" className="pl-10" {...register('password', { required: true })} />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.password && <p className="text-[10px] text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Confirm Password</label>
                  <div className="relative">
                    <Input type="password" placeholder="••••••••" className="pl-10" {...register('confirmPassword', { required: true })} />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                  {...register('acceptTerms', { required: true })}
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground">
                  I agree to the WorkSphere Terms of Service, Privacy Policy and multi-tenant policies.
                </label>
              </div>
              {errors.acceptTerms && <p className="text-[10px] text-destructive">You must accept the terms.</p>}

              <Button type="submit" disabled={loading} className="w-full vibrant-gradient text-white hover:brightness-110 shadow-lg border-0 gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Onboarding Company...
                  </>
                ) : (
                  <>
                    Initialize WorkSphere Space <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-muted-foreground mt-4">
            Already have an active space?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterCompany;
