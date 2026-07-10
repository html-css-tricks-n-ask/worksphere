import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, FileText, Calendar, Trash2, Loader2 } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';
import { UploadComponent } from '../components/ui/upload-component.js';
import { ConfirmDialog } from '../components/ui/confirm-dialog.js';

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'timeline'>('profile');

  // Avatar uploading states
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Document states
  const [deleteDocOpen, setDeleteDocOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchEmployeeData = async () => {
    try {
      const [empRes, timelineRes] = await Promise.all([
        axiosInstance.get(`/employees/${id}`),
        axiosInstance.get(`/employees/${id}/timeline`),
      ]);
      setEmployee(empRes.data.data);
      setTimeline(timelineRes.data.data || []);
    } catch (err: any) {
      setErrorMsg('Failed to load employee details folder.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Avatar upload failed.');
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
    } catch (err: any) {
      setErrorMsg('Failed to delete document.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Employee details folder not found.</p>
        <Link to="/employees">
          <Button variant="outline">Back to Registry</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/employees">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">ID: {employee.employeeId}</p>
        </div>
      </div>

      {(successMsg || errorMsg) && (
        <div className="space-y-2">
          {successMsg && (
            <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex justify-between items-center">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10 flex justify-between items-center">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="font-bold">×</button>
            </div>
          )}
        </div>
      )}

      {/* Header Profile Info Card */}
      <Card className="shadow-sm overflow-hidden border">
        <div className="h-20 bg-muted/40 border-b relative" />
        <CardContent className="pt-0 relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-8 mb-4">
            <div className="relative w-24 h-24 rounded-2xl border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-md">
              {employee.avatar ? (
                <img src={employee.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                </div>
              )}
              <label htmlFor="avatar-file" className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-center cursor-pointer hover:bg-black/80 transition-colors">
                <span className="text-[9px] text-white font-bold uppercase tracking-tight">Upload</span>
                <input
                  id="avatar-file"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </label>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {employee.professionalInfo?.designationId?.title || 'No Designation'} • {employee.professionalInfo?.departmentId?.name || 'No Department'}
              </p>
            </div>

            <div className="sm:ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate(`/employees/${id}/edit`)} className="text-xs font-semibold">
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 border-t pt-4 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>{employee.phone || 'No phone number'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{employee.professionalInfo?.workLocation || 'Office Location'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-muted">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          General Profile
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'documents' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Document Archives
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'timeline' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Career Timeline ({timeline.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Personal & Work info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Date of Birth</span>
                  <p className="font-medium">
                    {employee.personalInfo?.dateOfBirth ? new Date(employee.personalInfo.dateOfBirth).toLocaleDateString() : 'Unconfigured'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Gender</span>
                  <p className="font-medium">{employee.personalInfo?.gender || 'Unconfigured'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Marital Status</span>
                  <p className="font-medium">{employee.personalInfo?.maritalStatus || 'Unconfigured'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Nationality</span>
                  <p className="font-medium">{employee.personalInfo?.nationality || 'Unconfigured'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Blood Group</span>
                  <p className="font-medium">{employee.personalInfo?.bloodGroup || 'Unconfigured'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Address Coordinates</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Current Address</span>
                  <p className="font-medium">{employee.address?.currentAddress || 'Unconfigured'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Permanent Address</span>
                  <p className="font-medium">{employee.address?.permanentAddress || 'Unconfigured'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Contact Name</span>
                  <p className="font-medium">{employee.emergencyContact?.contactName || 'Unconfigured'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Relation</span>
                  <p className="font-medium">{employee.emergencyContact?.relation || 'Unconfigured'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Phone Number</span>
                  <p className="font-medium">{employee.emergencyContact?.phone || 'Unconfigured'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar column: Skills & manager */}
          <div className="md:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Professional Placement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Reporting Line Manager</span>
                  <p className="font-medium">
                    {employee.professionalInfo?.managerId 
                      ? `${employee.professionalInfo.managerId.firstName} ${employee.professionalInfo.managerId.lastName}`
                      : 'Unassigned'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Employment Type</span>
                  <p className="font-medium">{employee.professionalInfo?.employmentType || 'Full-Time'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Salary Grade Level</span>
                  <p className="font-medium font-mono">{employee.professionalInfo?.salaryGrade || 'Unconfigured'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Joining Date</span>
                  <p className="font-medium">
                    {employee.professionalInfo?.joiningDate ? new Date(employee.professionalInfo.joiningDate).toLocaleDateString() : 'Unconfigured'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Skills Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                {employee.skills && employee.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {employee.skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No skills recorded.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: List files */}
          <div className="md:col-span-2 space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Uploaded Documents</CardTitle>
                <CardDescription>PAN, Passport, Resume archives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee.documents && employee.documents.length > 0 ? (
                  employee.documents.map((doc: any) => (
                    <div key={doc._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/15 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-bold hover:underline">
                            {doc.name}
                          </a>
                          <span className="text-[9px] text-muted-foreground">
                            Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive" onClick={() => { setSelectedDocId(doc._id); setDeleteDocOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No documents uploaded.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Upload Component */}
          <div className="md:col-span-1">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Add Document</CardTitle>
              </CardHeader>
              <CardContent>
                <UploadComponent
                  uploadUrl={`/employees/${id}/documents`}
                  onUploadSuccess={handleDocumentSuccess}
                  documentNameRequired
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Career & Employment History</CardTitle>
            <CardDescription>Track promotions, department transfers and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No historical entries found.</p>
            ) : (
              <div className="relative pl-6 border-l space-y-6 py-2 ml-4">
                {timeline.map((event: any) => (
                  <div key={event.id} className="relative">
                    {/* Circle icon */}
                    <div className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white border-4 border-card" />
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{event.type}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{event.description}</p>
                      {event.details && (
                        <div className="mt-1 bg-muted/30 p-2 rounded border text-[10px] font-mono max-w-sm">
                          Previous: {event.details.previous || 'None'} → New: {event.details.new || 'None'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Document Confirm */}
      <ConfirmDialog
        isOpen={deleteDocOpen}
        onClose={() => setDeleteDocOpen(false)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message="Are you sure you want to remove this document from the employee profile folder?"
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
};

export default EmployeeDetails;
