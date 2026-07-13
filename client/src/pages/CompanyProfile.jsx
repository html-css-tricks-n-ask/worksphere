 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building, Globe, Phone, MapPin, CheckCircle, UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { axiosInstance } from '../services/axiosInstance';
import { Dropdown } from '../components/ui/dropdown';

export const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);

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
      } catch (err) {
        setErrorMsg('Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const handleLogoUpload = async (e) => {
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
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const onSubmit = async (data) => {
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
      if (_optionalChain([response, 'access', _4 => _4.data, 'access', _5 => _5.data, 'optionalAccess', _6 => _6.logo])) {
        setLogoUrl(response.data.data.logo);
      }
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _7 => _7.response, 'optionalAccess', _8 => _8.data, 'optionalAccess', _9 => _9.message]) || 'Failed to update company settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      React.createElement('div', { className: "flex items-center justify-center min-h-[400px]"   ,}
        , React.createElement(Loader2, { className: "h-8 w-8 text-primary animate-spin"   ,} )
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-6",}
      , React.createElement('div', null
        , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Organization Profile" )
        , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, "Adjust company specifications, branding, and details."     )
      )

      , (successMsg || errorMsg) && (
        React.createElement('div', { className: "space-y-2",}
          , successMsg && (
            React.createElement('div', { className: "p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex items-center gap-2"          ,}
              , React.createElement(CheckCircle, { className: "h-4 w-4" ,} ), " " , successMsg
            )
          )
          , errorMsg && (
            React.createElement('div', { className: "p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10"       ,}
              , errorMsg
            )
          )
        )
      )

      , React.createElement('div', { className: "grid gap-6 md:grid-cols-3"  ,}
        /* Left Column: Branding Logo */
        , React.createElement(Card, { className: "md:col-span-1",}
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, null, "Branding & Identity"  )
            , React.createElement(CardDescription, null, "Setup your company logo assets for notifications and invoices."        )
          )
          , React.createElement(CardContent, { className: "flex flex-col items-center justify-center p-6 space-y-4"     ,}
            , React.createElement('div', { className: "relative w-36 h-36 rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-muted/20"          ,}
              , logoUrl ? (
                React.createElement('img', { src: logoUrl, alt: "Logo", className: "w-full h-full object-contain p-2"   ,} )
              ) : (
                React.createElement(Building, { className: "h-10 w-10 text-muted-foreground"  ,} )
              )

              , logoUploading && (
                React.createElement('div', { className: "absolute inset-0 bg-background/80 flex items-center justify-center"     ,}
                  , React.createElement(Loader2, { className: "h-5 w-5 text-primary animate-spin"   ,} )
                )
              )
            )

            , React.createElement('div', { className: "w-full",}
              , React.createElement('label', { htmlFor: "logo-file", className: "cursor-pointer",}
                , React.createElement('div', { className: "flex items-center justify-center gap-2 border rounded-lg px-4 py-2 hover:bg-muted text-xs font-semibold tracking-tight transition-colors"            ,}
                  , React.createElement(UploadCloud, { className: "h-4 w-4" ,} ), " Upload New Logo"
                )
                , React.createElement('input', {
                  id: "logo-file",
                  type: "file",
                  accept: "image/png, image/jpeg, image/jpg"  ,
                  className: "hidden",
                  onChange: handleLogoUpload,
                  disabled: logoUploading,}
                )
              )
              , React.createElement('p', { className: "text-[10px] text-center text-muted-foreground mt-2"   ,}, "PNG or JPEG formats. Under 10MB sizes."

              )
            )
          )
        )

        /* Right Column: Profile Form Details */
        , React.createElement(Card, { className: "md:col-span-2",}
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, null, "Workspace Settings" )
            , React.createElement(CardDescription, null, "Update addresses, employee limits, and fields."     )
          )
          , React.createElement(CardContent, null
            , React.createElement('form', { onSubmit: handleSubmit(onSubmit), className: "space-y-4",}
              , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2"  ,}
                , React.createElement('div', { className: "space-y-1.5",}
                  , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Company Name" )
                  , React.createElement(Input, { ...register('name'), placeholder: "Company Name" , required: true,} )
                )

                , React.createElement('div', { className: "space-y-1.5",}
                  , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Company Phone" )
                  , React.createElement('div', { className: "relative",}
                    , React.createElement(Input, { ...register('phone'), placeholder: "+1 (555) 123-4567"  , className: "pl-10",} )
                    , React.createElement(Phone, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                  )
                )

                , React.createElement('div', { className: "space-y-1.5",}
                  , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Website")
                  , React.createElement('div', { className: "relative",}
                    , React.createElement(Input, { ...register('website'), placeholder: "https://acme.com", className: "pl-10",} )
                    , React.createElement(Globe, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                  )
                )

                , React.createElement('div', { className: "space-y-1.5",}
                  , React.createElement(Dropdown, {
                    label: "Company Size" ,
                    options: [
                      { value: '1-10', label: '1-10' },
                      { value: '11-50', label: '11-50' },
                      { value: '51-200', label: '51-200' },
                      { value: '201-500', label: '201-500' },
                      { value: '500+', label: '500+' },
                    ],
                    ...register('companySize'),}
                  )
                )

                , React.createElement('div', { className: "space-y-1.5",}
                  , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Industry Sector" )
                  , React.createElement(Input, { ...register('industry'), placeholder: "Technology, Healthcare..." ,} )
                )

                , React.createElement('div', { className: "space-y-1.5",}
                  , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Country")
                  , React.createElement(Input, { ...register('country'), placeholder: "United States" ,} )
                )

                , React.createElement('div', { className: "space-y-1.5",}
                  , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Timezone")
                  , React.createElement(Input, { ...register('timezone'), placeholder: "GMT-5 / America/New_York"  ,} )
                )

                , React.createElement('div', { className: "space-y-1.5",}
                  , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Address Coordinates" )
                  , React.createElement('div', { className: "relative",}
                    , React.createElement(Input, { ...register('address'), placeholder: "123 Corporate Blvd"  , className: "pl-10",} )
                    , React.createElement(MapPin, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground"     ,} )
                  )
                )
              )

              , React.createElement('div', { className: "flex justify-end pt-4 border-t"   ,}
                , React.createElement(Button, { type: "submit", disabled: saving, className: "vibrant-gradient text-white shadow-md border-0 gap-2"    ,}
                  , saving ? (
                    React.createElement(React.Fragment, null
                      , React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  ,} ), " Saving..."
                    )
                  ) : (
                    'Save Profile Details'
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};

export default CompanyProfile;
