import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { axiosInstance } from '../services/axiosInstance.js';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setError('Verification token is missing.');
        setLoading(false);
        return;
      }
      try {
        await axiosInstance.get(`/auth/verify-email?token=${token}`);
        setSuccess(true);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Verification failed. The token may be expired.');
      } finally {
        setLoading(false);
      }
    };

    triggerVerification();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-xl text-center border">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {loading && (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {!loading && success && (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                <ShieldCheck className="h-6 w-6" />
              </div>
            )}
            {!loading && error && (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="h-6 w-6" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {loading ? 'Verifying Account' : success ? 'Verify Success!' : 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {loading
              ? 'Please wait while we validate your security email credentials...'
              : success
              ? 'Your email address has been verified successfully.'
              : 'An error occurred during account validation.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && success && (
            <>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Your administrator account is now active and ready for space setup.
              </p>
              <Link to="/login">
                <Button className="w-full vibrant-gradient text-white border-0 shadow-md">Sign In to Dashboard</Button>
              </Link>
            </>
          )}

          {!loading && error && (
            <>
              <p className="text-sm text-destructive font-medium bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                {error}
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to Login</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
