import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';

interface FileWithPreview {
  file: File;
  preview: string | null;
  id: string;
}

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

let _id = 0;
const uid = () => String(++_id);

export default function FileUpload({
  onFilesChange,
  maxFiles = 10,
  maxSizeMB = 20,
  className,
}: FileUploadProps) {
  const [stagedFiles, setStagedFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      const newErrors: string[] = [];
      rejected.forEach(({ file, errors: errs }) => {
        errs.forEach((e) => {
          if (e.code === 'file-too-large') newErrors.push(`${file.name}: exceeds ${maxSizeMB}MB limit`);
          else if (e.code === 'file-invalid-type') newErrors.push(`${file.name}: unsupported file type`);
          else if (e.code === 'too-many-files') newErrors.push(`Maximum ${maxFiles} files allowed`);
          else newErrors.push(`${file.name}: ${e.message}`);
        });
      });
      setErrors([...new Set(newErrors)]);

      setStagedFiles((prev) => {
        const next: FileWithPreview[] = [
          ...prev,
          ...accepted.map((f) => ({
            id: uid(),
            file: f,
            preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
          })),
        ].slice(0, maxFiles);
        onFilesChange(next.map((n) => n.file));
        return next;
      });
    },
    [maxFiles, maxSizeMB, onFilesChange],
  );

  const remove = (id: string) => {
    setStagedFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      onFilesChange(next.map((n) => n.file));
      return next;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'application/pdf': ['.pdf'],
      'video/mp4': ['.mp4'],
    },
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const photos = stagedFiles.filter((f) => f.preview);
  const docs = stagedFiles.filter((f) => !f.preview);

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 cursor-pointer',
          'transition-all duration-150',
          isDragActive
            ? 'border-primary-400 bg-primary-50 shadow-[inset_0_0_0_1px_rgba(15,118,110,0.15)]'
            : 'border-slate-200 bg-slate-50/70 hover:border-primary-300 hover:bg-primary-50/30',
        )}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-2xl border transition-colors duration-150',
            isDragActive
              ? 'bg-primary-100 border-primary-200 text-primary-600'
              : 'bg-white border-slate-200 text-slate-400',
          )}
        >
          <CloudArrowUpIcon className="w-6 h-6" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            {isDragActive ? 'Release to upload' : 'Drag files here, or click to browse'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            PNG, JPG, WebP, PDF, MP4 &middot; up to {maxSizeMB}MB per file
          </p>
        </div>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <ul className="mt-3 space-y-1">
          {errors.map((e, i) => (
            <li key={i} className="text-xs text-red-600">{e}</li>
          ))}
        </ul>
      )}

      {/* Previews ─────────────────────────────────────────────────────────── */}
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {photos.map((f) => (
            <div key={f.id} className="group relative aspect-square">
              <img
                src={f.preview!}
                alt={f.file.name}
                className="w-full h-full object-cover rounded-xl border border-slate-200"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 rounded-xl bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors duration-150" />
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-600"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
              <p className="absolute inset-x-0 bottom-0 px-2 pb-1.5 text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity duration-150 drop-shadow">
                {f.file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <div className="mt-3 space-y-2">
          {docs.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 shrink-0">
                {f.file.type.startsWith('video/') ? (
                  <PhotoIcon className="w-4 h-4 text-slate-400" />
                ) : (
                  <DocumentIcon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{f.file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(f.file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
