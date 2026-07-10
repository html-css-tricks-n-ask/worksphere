import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building, Globe, Phone, MapPin, CheckCircle, UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { Input } from '../components/ui/input.js';
import { Button } from '../components/ui/button.js';
import { axiosInstance } from '../services/axiosInstance.js';
import { Dropdown } from '../components/ui/dropdown.js';

export const CompanyProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/company/profile');
        const company = response.data.data;
        reset({
          name: company.name,
          phone: company.phone || '',
          website: company.website || '',
          address: company.address || '',
          country: company.country || '',
          timezone: company.timezone || '',
          industry: company.industry || '',
          companySize: company.companySize || '',
        });
        if (company.logo) {
          setLogoUrl(company.logo);
        }
      } catch (err: any) {
        setErrorMsg('Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setLogoUploading(true);
    setErrorMsg(null);
    try {
      const response = await axiosInstance.post('/uploads/company-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { url } = response.data.data;
      setLogoUrl(url);
      setSuccessMsg('Logo uploaded successfully. Make sure to save profile details.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const payload = {
        ...data,
        logo: logoUrl || '',
      };
      const response = await axiosInstance.put('/company/profile', payload);
      setSuccessMsg('Company settings saved successfully.');
      reset(response.data.data);
      if (response.data.data?.logo) {
        setLogoUrl(response.data.data.logo);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update company settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Profile</h1>
        <p className="text-sm text-muted-foreground">Adjust company specifications, branding, and details.</p>
      </div>

      {(successMsg || errorMsg) && (
        <div className="space-y-2">
          {successMsg && (
            <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Branding Logo */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Branding & Identity</CardTitle>
            <CardDescription>Setup your company logo assets for notifications and invoices.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative w-36 h-36 rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-muted/20">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Building className="h-10 w-10 text-muted-foreground" />
              )}

              {logoUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                </div>
              )}
            </div>

            <div className="w-full">
              <label htmlFor="logo-file" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 border rounded-lg px-4 py-2 hover:bg-muted text-xs font-semibold tracking-tight transition-colors">
                  <UploadCloud className="h-4 w-4" /> Upload New Logo
                </div>
                <input
                  id="logo-file"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                />
              </label>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                PNG or JPEG formats. Under 10MB sizes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Profile Form Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
            <CardDescription>Update addresses, employee limits, and fields.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                  <Input {...register('name')} placeholder="Company Name" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Company Phone</label>
                  <div className="relative">
                    <Input {...register('phone')} placeholder="+1 (555) 123-4567" className="pl-10" />
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Website</label>
                  <div className="relative">
                    <Input {...register('website')} placeholder="https://acme.com" className="pl-10" />
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

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
                  <label className="text-xs font-semibold text-muted-foreground">Industry Sector</label>
                  <Input {...register('industry')} placeholder="Technology, Healthcare..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Country</label>
                  <Input {...register('country')} placeholder="United States" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Timezone</label>
                  <Input {...register('timezone')} placeholder="GMT-5 / America/New_York" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Address Coordinates</label>
                  <div className="relative">
                    <Input {...register('address')} placeholder="123 Corporate Blvd" className="pl-10" />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={saving} className="vibrant-gradient text-white shadow-md border-0 gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Profile Details'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProfile;
