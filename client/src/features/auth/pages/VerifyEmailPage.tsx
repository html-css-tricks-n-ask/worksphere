import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service.js';
import { Button } from '../../../components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';

/**
 * Orchestrator VerifyEmailPage component.
 * Performs verification on component mount using search parameter validation.
 */
export const VerifyEmailPage: React.FC = () => {
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
        await authService.verifyEmail(token);
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
            {loading ? 'Validating your security parameters...' : success ? 'Your email is validated.' : error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!loading && (
            <Link to="/login">
              <Button className="w-full mt-2">
                {success ? 'Proceed to Sign In' : 'Back to Login Screen'}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
