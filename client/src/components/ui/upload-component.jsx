 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import * as React from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { axiosInstance } from '../../services/axiosInstance';










export const UploadComponent = ({
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
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const fileInputRef = React.useRef(null);

  const handleUpload = async (file) => {
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
    } catch (err) {
      setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    React.createElement('div', { className: "space-y-4",}
      , documentNameRequired && (
        React.createElement('div', { className: "space-y-1.5",}
          , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Document Name / Label"   )
          , React.createElement('input', {
            type: "text",
            placeholder: "e.g. Resume, Offer Letter"   ,
            value: docName,
            onChange: (e) => setDocName(e.target.value),
            className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"                     ,}
          )
        )
      )

      , React.createElement('div', {
        onDragEnter: handleDrag,
        onDragOver: handleDrag,
        onDragLeave: handleDrag,
        onDrop: handleDrop,
        className: `border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 bg-muted/5'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`,}

        , uploading ? (
          React.createElement('div', { className: "flex flex-col items-center space-y-2"   ,}
            , React.createElement(Loader2, { className: "h-8 w-8 text-primary animate-spin"   ,} )
            , React.createElement('p', { className: "text-xs font-semibold" ,}, "Streaming asset to secure cloud node..."     )
          )
        ) : (
          React.createElement(React.Fragment, null
            , React.createElement(UploadCloud, { className: "h-9 w-9 text-muted-foreground mb-3"   ,} )
            , React.createElement('p', { className: "text-xs font-semibold mb-1"  ,}, "Drag & drop document file here, or"
                    , ' '
              , React.createElement('button', {
                type: "button",
                onClick: () => _optionalChain([fileInputRef, 'access', _4 => _4.current, 'optionalAccess', _5 => _5.click, 'call', _6 => _6()]),
                className: "text-primary hover:underline font-bold"  ,
                disabled: documentNameRequired && !docName,}
, "browse"

              )
            )
            , React.createElement('p', { className: "text-[10px] text-muted-foreground" ,}, "PNG, JPG, JPEG, PDF up to "
                    , maxSizeMB, "MB"
            )
            , documentNameRequired && !docName && (
              React.createElement('p', { className: "text-[9px] text-amber-500 font-medium mt-2"   ,}, "* Specify document name to unlock uploads browse trigger."

              )
            )
          )
        )

        , React.createElement('input', {
          ref: fileInputRef,
          type: "file",
          className: "hidden",
          onChange: handleFileChange,
          accept: allowedTypes.join(','),}
        )
      )

      , error && (
        React.createElement('div', { className: "p-3 text-xs text-destructive bg-destructive/10 rounded-lg font-medium border border-destructive/20 flex items-center gap-2"          ,}
          , React.createElement(AlertCircle, { className: "h-4 w-4 shrink-0"  ,} )
          , React.createElement('span', null, error)
        )
      )

      , success && (
        React.createElement('div', { className: "p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex items-center gap-2"          ,}
          , React.createElement(CheckCircle, { className: "h-4 w-4 shrink-0"  ,} )
          , React.createElement('span', null, "Asset uploaded and indexed successfully."    )
        )
      )
    )
  );
};

export default UploadComponent;
