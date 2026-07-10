import * as React from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { axiosInstance } from '../../services/axiosInstance.js';

export interface UploadComponentProps {
  uploadUrl: string; // e.g. "/employees/123/documents" or "/uploads/company-logo"
  fieldName?: string; // e.g. "file"
  allowedTypes?: string[]; // e.g. ['image/png', 'image/jpeg', 'application/pdf']
  maxSizeMB?: number; // e.g. 10
  onUploadSuccess: (data: any) => void;
  documentNameRequired?: boolean;
}

export const UploadComponent: React.FC<UploadComponentProps> = ({
  uploadUrl,
  fieldName = 'file',
  allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
  maxSizeMB = 10,
  onUploadSuccess,
  documentNameRequired = false,
}) => {
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [docName, setDocName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // Check validation constraints
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Only JPG, PNG, and PDF formats are allowed.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the limit of ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append(fieldName, file);
    if (documentNameRequired) {
      formData.append('name', docName || file.name.split('.')[0]);
    }

    try {
      const response = await axiosInstance.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setDocName('');
      onUploadSuccess(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {documentNameRequired && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Document Name / Label</label>
          <input
            type="text"
            placeholder="e.g. Resume, Offer Letter"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 bg-muted/5'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs font-semibold">Streaming asset to secure cloud node...</p>
          </div>
        ) : (
          <>
            <UploadCloud className="h-9 w-9 text-muted-foreground mb-3" />
            <p className="text-xs font-semibold mb-1">
              Drag & drop document file here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-bold"
                disabled={documentNameRequired && !docName}
              >
                browse
              </button>
            </p>
            <p className="text-[10px] text-muted-foreground">
              PNG, JPG, JPEG, PDF up to {maxSizeMB}MB
            </p>
            {documentNameRequired && !docName && (
              <p className="text-[9px] text-amber-500 font-medium mt-2">
                * Specify document name to unlock uploads browse trigger.
              </p>
            )}
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={allowedTypes.join(',')}
        />
      </div>

      {error && (
        <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg font-medium border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Asset uploaded and indexed successfully.</span>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
