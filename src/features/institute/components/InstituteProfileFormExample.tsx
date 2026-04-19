/**
 * Example: Institute Profile Form with File Upload
 *
 * This is a reference implementation showing how to integrate the storage system
 * into a real form component.
 *
 * Copy and adapt this pattern for other forms.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useFileUpload } from '@/hooks/useFileUpload';
import { validateFile, formatFileSize, isImageFile } from '@/lib/storage/utils';

interface InstituteProfileFormProps {
  initialData?: {
    name: string;
    logo?: string;
    banner?: string;
  };
  onSubmit: (data: {
    name: string;
    logo?: string;
    banner?: string;
  }) => Promise<void>;
}

/**
 * Image upload field component
 */
function ImageUploadField({
  label,
  currentUrl,
  onChange,
  isLoading,
  error,
  folder,
}: {
  label: string;
  currentUrl?: string;
  onChange: (url: string) => void;
  isLoading: boolean;
  error: Error | null;
  folder: 'institutes' | 'users' | 'courses' | 'documents';
}) {
  const { uploadFile } = useFileUpload({
    onSuccess: (fileUrl) => {
      onChange(fileUrl);
    },
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setLocalError(validation.error ?? null);
      return;
    }

    // Show preview
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Upload file
    try {
      await uploadFile(file, folder, file.name);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      {/* Preview */}
      <div className="mb-4 h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : currentUrl ? (
          <Image src={currentUrl} alt={label} width={96} height={96} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No image</div>
        )}
      </div>

      {/* Upload input */}
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isLoading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:rounded-lg file:border-0
          file:bg-blue-50 file:px-4 file:py-2
          file:text-sm file:font-semibold
          file:text-blue-700 hover:file:bg-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Status messages */}
      {isLoading && <p className="text-sm text-blue-600">Uploading...</p>}
      {(error || localError) && <p className="text-sm text-red-600">{error?.message || localError}</p>}
      {currentUrl && !isLoading && !error && (
        <p className="text-sm text-green-600">
          ✓ Uploaded: {currentUrl.split('/').pop()}
        </p>
      )}
    </div>
  );
}

/**
 * Example form component
 */
export function InstituteProfileForm({ initialData, onSubmit }: InstituteProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    logo: initialData?.logo || '',
    banner: initialData?.banner || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    try {
      setIsSaving(true);
      await onSubmit(formData);
      // Show success message or redirect
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Name field */}
      <div>
        <label className="block text-sm font-medium">Institute Name</label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSaving}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2
            focus:border-blue-500 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Logo upload */}
      <ImageUploadField
        label="Institute Logo"
        currentUrl={formData.logo}
        onChange={(url) => setFormData({ ...formData, logo: url })}
        isLoading={isSaving}
        error={null}
        folder="institutes"
      />

      {/* Banner upload */}
      <ImageUploadField
        label="Banner Image"
        currentUrl={formData.banner}
        onChange={(url) => setFormData({ ...formData, banner: url })}
        isLoading={isSaving}
        error={null}
        folder="institutes"
      />

      {/* Error message */}
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {saveError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

/**
 * Usage example in a page:
 *
 * ```tsx
 * import { InstituteProfileForm } from '@/features/institute/components/InstituteProfileForm';
 *
 * export default function SettingsPage() {
 *   const [institute, setInstitute] = useState(null);
 *
 *   const handleSave = async (data) => {
 *     const response = await fetch('/api/v1/institutes/me', {
 *       method: 'PUT',
 *       body: JSON.stringify(data),
 *     });
 *     const updated = await response.json();
 *     setInstitute(updated);
 *   };
 *
 *   return (
 *     <InstituteProfileForm
 *       initialData={institute}
 *       onSubmit={handleSave}
 *     />
 *   );
 * }\n ```\n */
