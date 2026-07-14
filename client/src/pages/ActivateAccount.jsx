import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Activation token is missing from URL.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await axiosInstance.post('/auth/activate', { token, password });
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification or password configuration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-emerald-500">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Account Activated!</CardTitle>
            <CardDescription>Your password is configured and employee portal is ready.</CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4 space-y-4">
            <p className="text-xs text-muted-foreground">You can now proceed to log in with your email address and the password you configured.</p>
            <Button className="w-full vibrant-gradient text-white" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Set Up Your Account</CardTitle>
          <CardDescription>Configure credentials to activate your employee profile</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {!token ? (
            <div className="p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Invalid request. Activation link is missing the token parameter.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Create Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full vibrant-gradient text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Configure & Activate Account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivateAccount;
