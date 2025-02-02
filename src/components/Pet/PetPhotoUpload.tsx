import React, { useState, useRef } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PetPhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (file: File | null) => void;
}

export const PetPhotoUpload: React.FC<PetPhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoChange
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onPhotoChange(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onPhotoChange(null);
  };

  return (
    <div className="relative">
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Photo de l'animal"
            className="w-full h-72 object-cover rounded-lg shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-72 border-2 border-dashed border-gray-300 rounded-lg flex flex-col 
                   items-center justify-center cursor-pointer hover:border-gray-400 
                   transition-colors duration-200"
        >
          <CameraIcon className="h-12 w-12 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">
            Cliquez pour ajouter une photo
          </span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}; 