 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, FileText, Calendar, Trash2, Loader2 } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { UploadComponent } from '../components/ui/upload-component';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Avatar uploading states
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Document states
  const [deleteDocOpen, setDeleteDocOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchEmployeeData = async () => {
    try {
      const [empRes, timelineRes] = await Promise.all([
        axiosInstance.get(`/employees/${id}`),
        axiosInstance.get(`/employees/${id}/timeline`),
      ]);
      setEmployee(empRes.data.data);
      setTimeline(timelineRes.data.data || []);
    } catch (err) {
      setErrorMsg('Failed to load employee details folder.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const handleAvatarUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setAvatarUploading(true);
    setErrorMsg(null);
    try {
      await axiosInstance.post(`/employees/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMsg('Avatar updated successfully.');
      fetchEmployeeData();
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Avatar upload failed.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDocumentSuccess = () => {
    setSuccessMsg('Document uploaded and index updated.');
    fetchEmployeeData();
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocId) return;
    try {
      await axiosInstance.delete(`/employees/${id}/documents/${selectedDocId}`);
      setSuccessMsg('Document deleted successfully.');
      setSelectedDocId(null);
      fetchEmployeeData();
    } catch (err) {
      setErrorMsg('Failed to delete document.');
    }
  };

  if (loading) {
    return (
      React.createElement('div', { className: "flex items-center justify-center min-h-[400px]"   ,}
        , React.createElement(Loader2, { className: "h-8 w-8 text-primary animate-spin"   ,} )
      )
    );
  }

  if (!employee) {
    return (
      React.createElement('div', { className: "text-center py-12 space-y-4"  ,}
        , React.createElement('p', { className: "text-muted-foreground",}, "Employee details folder not found."    )
        , React.createElement(Link, { to: "/employees",}
          , React.createElement(Button, { variant: "outline",}, "Back to Registry"  )
        )
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-6",}
      , React.createElement('div', { className: "flex items-center gap-4"  ,}
        , React.createElement(Link, { to: "/employees",}
          , React.createElement(Button, { variant: "outline", size: "icon", className: "h-8 w-8" ,}
            , React.createElement(ArrowLeft, { className: "h-4 w-4" ,} )
          )
        )
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}
            , employee.firstName, " " , employee.lastName
          )
          , React.createElement('p', { className: "text-sm text-muted-foreground font-mono"  ,}, "ID: " , employee.employeeId)
        )
      )

      , (successMsg || errorMsg) && (
        React.createElement('div', { className: "space-y-2",}
          , successMsg && (
            React.createElement('div', { className: "p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex justify-between items-center"          ,}
              , React.createElement('span', null, successMsg)
              , React.createElement('button', { onClick: () => setSuccessMsg(null), className: "font-bold",}, "×")
            )
          )
          , errorMsg && (
            React.createElement('div', { className: "p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10 flex justify-between items-center"          ,}
              , React.createElement('span', null, errorMsg)
              , React.createElement('button', { onClick: () => setErrorMsg(null), className: "font-bold",}, "×")
            )
          )
        )
      )

      /* Header Profile Info Card */
      , React.createElement(Card, { className: "shadow-sm overflow-hidden border"  ,}
        , React.createElement('div', { className: "h-20 bg-muted/40 border-b relative"   ,} )
        , React.createElement(CardContent, { className: "pt-0 relative px-6 pb-6"   ,}
          , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-8 mb-4"       ,}
            , React.createElement('div', { className: "relative w-24 h-24 rounded-2xl border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-md"           ,}
              , employee.avatar ? (
                React.createElement('img', { src: employee.avatar, alt: "Avatar", className: "w-full h-full object-cover"  ,} )
              ) : (
                React.createElement(User, { className: "h-10 w-10 text-muted-foreground"  ,} )
              )
              , avatarUploading && (
                React.createElement('div', { className: "absolute inset-0 bg-background/80 flex items-center justify-center"     ,}
                  , React.createElement(Loader2, { className: "h-5 w-5 text-primary animate-spin"   ,} )
                )
              )
              , React.createElement('label', { htmlFor: "avatar-file", className: "absolute bottom-0 inset-x-0 bg-black/60 py-1 text-center cursor-pointer hover:bg-black/80 transition-colors"        ,}
                , React.createElement('span', { className: "text-[9px] text-white font-bold uppercase tracking-tight"    ,}, "Upload")
                , React.createElement('input', {
                  id: "avatar-file",
                  type: "file",
                  accept: "image/png, image/jpeg, image/jpg"  ,
                  className: "hidden",
                  onChange: handleAvatarUpload,
                  disabled: avatarUploading,}
                )
              )
            )

            , React.createElement('div', { className: "space-y-1",}
              , React.createElement('h2', { className: "text-lg font-bold" ,}
                , employee.firstName, " " , employee.lastName
              )
              , React.createElement('p', { className: "text-xs text-muted-foreground flex items-center gap-1.5"    ,}
                , React.createElement(Briefcase, { className: "h-3.5 w-3.5" ,} )
                , _optionalChain([employee, 'access', _4 => _4.professionalInfo, 'optionalAccess', _5 => _5.designationId, 'optionalAccess', _6 => _6.title]) || 'No Designation', " • "  , _optionalChain([employee, 'access', _7 => _7.professionalInfo, 'optionalAccess', _8 => _8.departmentId, 'optionalAccess', _9 => _9.name]) || 'No Department'
              )
            )

            , React.createElement('div', { className: "sm:ml-auto flex gap-2"  ,}
              , React.createElement(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/employees/${id}/edit`), className: "text-xs font-semibold" ,}, "Edit Profile"

              )
            )
          )

          , React.createElement('div', { className: "grid gap-4 sm:grid-cols-3 border-t pt-4 text-xs"     ,}
            , React.createElement('div', { className: "flex items-center gap-2 text-muted-foreground"   ,}
              , React.createElement(Mail, { className: "h-4 w-4 shrink-0 text-primary"   ,} )
              , React.createElement('span', { className: "truncate",}, employee.email)
            )
            , React.createElement('div', { className: "flex items-center gap-2 text-muted-foreground"   ,}
              , React.createElement(Phone, { className: "h-4 w-4 shrink-0 text-primary"   ,} )
              , React.createElement('span', null, employee.phone || 'No phone number')
            )
            , React.createElement('div', { className: "flex items-center gap-2 text-muted-foreground"   ,}
              , React.createElement(MapPin, { className: "h-4 w-4 shrink-0 text-primary"   ,} )
              , React.createElement('span', { className: "truncate",}, _optionalChain([employee, 'access', _10 => _10.professionalInfo, 'optionalAccess', _11 => _11.workLocation]) || 'Office Location')
            )
          )
        )
      )

      /* Tabs */
      , React.createElement('div', { className: "flex border-b border-muted"  ,}
        , React.createElement('button', {
          onClick: () => setActiveTab('profile'),
          className: `px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`,}
, "General Profile"

        )
        , React.createElement('button', {
          onClick: () => setActiveTab('documents'),
          className: `px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'documents' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`,}
, "Document Archives"

        )
        , React.createElement('button', {
          onClick: () => setActiveTab('timeline'),
          className: `px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'timeline' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`,}
, "Career Timeline ("
            , timeline.length, ")"
        )
      )

      /* Tab Panels */
      , activeTab === 'profile' && (
        React.createElement('div', { className: "grid gap-6 md:grid-cols-3"  ,}
          /* Personal & Work info */
          , React.createElement('div', { className: "md:col-span-2 space-y-6" ,}
            , React.createElement(Card, { className: "shadow-sm",}
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Personal Information" )
              )
              , React.createElement(CardContent, { className: "grid gap-4 sm:grid-cols-2 text-xs"   ,}
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Date of Birth"  )
                  , React.createElement('p', { className: "font-medium",}
                    , _optionalChain([employee, 'access', _12 => _12.personalInfo, 'optionalAccess', _13 => _13.dateOfBirth]) ? new Date(employee.personalInfo.dateOfBirth).toLocaleDateString() : 'Unconfigured'
                  )
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Gender")
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _14 => _14.personalInfo, 'optionalAccess', _15 => _15.gender]) || 'Unconfigured')
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Marital Status" )
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _16 => _16.personalInfo, 'optionalAccess', _17 => _17.maritalStatus]) || 'Unconfigured')
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Nationality")
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _18 => _18.personalInfo, 'optionalAccess', _19 => _19.nationality]) || 'Unconfigured')
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Blood Group" )
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _20 => _20.personalInfo, 'optionalAccess', _21 => _21.bloodGroup]) || 'Unconfigured')
                )
              )
            )

            , React.createElement(Card, { className: "shadow-sm",}
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Address Coordinates" )
              )
              , React.createElement(CardContent, { className: "grid gap-4 sm:grid-cols-2 text-xs"   ,}
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Current Address" )
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _22 => _22.address, 'optionalAccess', _23 => _23.currentAddress]) || 'Unconfigured')
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Permanent Address" )
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _24 => _24.address, 'optionalAccess', _25 => _25.permanentAddress]) || 'Unconfigured')
                )
              )
            )

            , React.createElement(Card, { className: "shadow-sm",}
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Emergency Contacts" )
              )
              , React.createElement(CardContent, { className: "grid gap-4 sm:grid-cols-3 text-xs"   ,}
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Contact Name" )
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _26 => _26.emergencyContact, 'optionalAccess', _27 => _27.contactName]) || 'Unconfigured')
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Relation")
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _28 => _28.emergencyContact, 'optionalAccess', _29 => _29.relation]) || 'Unconfigured')
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Phone Number" )
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _30 => _30.emergencyContact, 'optionalAccess', _31 => _31.phone]) || 'Unconfigured')
                )
              )
            )
          )

          /* Right sidebar column: Skills & manager */
          , React.createElement('div', { className: "md:col-span-1 space-y-6" ,}
            , React.createElement(Card, { className: "shadow-sm",}
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Professional Placement" )
              )
              , React.createElement(CardContent, { className: "space-y-4 text-xs" ,}
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Reporting Line Manager"  )
                  , React.createElement('p', { className: "font-medium",}
                    , _optionalChain([employee, 'access', _32 => _32.professionalInfo, 'optionalAccess', _33 => _33.managerId]) 
                      ? `${employee.professionalInfo.managerId.firstName} ${employee.professionalInfo.managerId.lastName}`
                      : 'Unassigned'
                  )
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Employment Type" )
                  , React.createElement('p', { className: "font-medium",}, _optionalChain([employee, 'access', _34 => _34.professionalInfo, 'optionalAccess', _35 => _35.employmentType]) || 'Full-Time')
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Salary Grade Level"  )
                  , React.createElement('p', { className: "font-medium font-mono" ,}, _optionalChain([employee, 'access', _36 => _36.professionalInfo, 'optionalAccess', _37 => _37.salaryGrade]) || 'Unconfigured')
                )
                , React.createElement('div', { className: "space-y-1",}
                  , React.createElement('span', { className: "text-muted-foreground font-semibold" ,}, "Joining Date" )
                  , React.createElement('p', { className: "font-medium",}
                    , _optionalChain([employee, 'access', _38 => _38.professionalInfo, 'optionalAccess', _39 => _39.joiningDate]) ? new Date(employee.professionalInfo.joiningDate).toLocaleDateString() : 'Unconfigured'
                  )
                )
              )
            )

            , React.createElement(Card, { className: "shadow-sm",}
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Skills Matrix" )
              )
              , React.createElement(CardContent, null
                , employee.skills && employee.skills.length > 0 ? (
                  React.createElement('div', { className: "flex flex-wrap gap-1.5"  ,}
                    , employee.skills.map((skill, idx) => (
                      React.createElement(Badge, { key: idx, variant: "outline", className: "text-xs",}
                        , skill
                      )
                    ))
                  )
                ) : (
                  React.createElement('p', { className: "text-xs text-muted-foreground" ,}, "No skills recorded."  )
                )
              )
            )
          )
        )
      )

      , activeTab === 'documents' && (
        React.createElement('div', { className: "grid gap-6 md:grid-cols-3"  ,}
          /* Left Column: List files */
          , React.createElement('div', { className: "md:col-span-2 space-y-4" ,}
            , React.createElement(Card, { className: "shadow-sm",}
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Uploaded Documents" )
                , React.createElement(CardDescription, null, "PAN, Passport, Resume archives"   )
              )
              , React.createElement(CardContent, { className: "space-y-3",}
                , employee.documents && employee.documents.length > 0 ? (
                  employee.documents.map((doc) => (
                    React.createElement('div', { key: doc._id, className: "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/15 transition-colors"       ,}
                      , React.createElement('div', { className: "flex items-center gap-3"  ,}
                        , React.createElement('div', { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"       ,}
                          , React.createElement(FileText, { className: "h-5 w-5" ,} )
                        )
                        , React.createElement('div', { className: "flex flex-col" ,}
                          , React.createElement('a', { href: doc.url, target: "_blank", rel: "noreferrer", className: "text-xs font-bold hover:underline"  ,}
                            , doc.name
                          )
                          , React.createElement('span', { className: "text-[9px] text-muted-foreground" ,}, "Uploaded on "
                              , new Date(doc.uploadedAt).toLocaleDateString()
                          )
                        )
                      )
                      , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive/80 hover:text-destructive"   , onClick: () => { setSelectedDocId(doc._id); setDeleteDocOpen(true); },}
                        , React.createElement(Trash2, { className: "h-4 w-4" ,} )
                      )
                    )
                  ))
                ) : (
                  React.createElement('p', { className: "text-xs text-muted-foreground text-center py-6"   ,}, "No documents uploaded."

                  )
                )
              )
            )
          )

          /* Right Column: Upload Component */
          , React.createElement('div', { className: "md:col-span-1",}
            , React.createElement(Card, { className: "shadow-sm",}
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Add Document" )
              )
              , React.createElement(CardContent, null
                , React.createElement(UploadComponent, {
                  uploadUrl: `/employees/${id}/documents`,
                  onUploadSuccess: handleDocumentSuccess,
                  documentNameRequired: true,}
                )
              )
            )
          )
        )
      )

      , activeTab === 'timeline' && (
        React.createElement(Card, { className: "shadow-sm",}
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Career & Employment History"   )
            , React.createElement(CardDescription, null, "Track promotions, department transfers and updates"     )
          )
          , React.createElement(CardContent, null
            , timeline.length === 0 ? (
              React.createElement('p', { className: "text-xs text-muted-foreground text-center py-6"   ,}, "No historical entries found."   )
            ) : (
              React.createElement('div', { className: "relative pl-6 border-l space-y-6 py-2 ml-4"     ,}
                , timeline.map((event) => (
                  React.createElement('div', { key: event.id, className: "relative",}
                    /* Circle icon */
                    , React.createElement('div', { className: "absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white border-4 border-card"            ,} )

                    , React.createElement('div', { className: "space-y-1 text-xs" ,}
                      , React.createElement('div', { className: "flex items-center gap-2"  ,}
                        , React.createElement('span', { className: "font-bold",}, event.type)
                        , React.createElement('span', { className: "text-[10px] text-muted-foreground flex items-center gap-1"    ,}
                          , React.createElement(Calendar, { className: "h-3 w-3" ,} )
                          , new Date(event.date).toLocaleDateString()
                        )
                      )
                      , React.createElement('p', { className: "text-muted-foreground",}, event.description)
                      , event.details && (
                        React.createElement('div', { className: "mt-1 bg-muted/30 p-2 rounded border text-[10px] font-mono max-w-sm"       ,}, "Previous: "
                           , event.details.previous || 'None', " → New: "   , event.details.new || 'None'
                        )
                      )
                    )
                  )
                ))
              )
            )
          )
        )
      )

      /* Delete Document Confirm */
      , React.createElement(ConfirmDialog, {
        isOpen: deleteDocOpen,
        onClose: () => setDeleteDocOpen(false),
        onConfirm: handleDeleteDocument,
        title: "Delete Document" ,
        message: "Are you sure you want to remove this document from the employee profile folder?"             ,
        confirmText: "Remove",
        variant: "destructive",}
      )
    )
  );
};

export default EmployeeDetails;
