import React, { useRef, useState } from 'react';
import { useSupabaseUpload } from '../hooks/useSupabaseUpload';

interface Props {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  folder?: string;
  label?: string;
  required?: boolean;
  maxSizeMB?: number;
}

const SupabaseImageUploader: React.FC<Props> = ({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder = 'uploads',
  label = 'Imagen',
  required = false,
  maxSizeMB = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  const { uploadImage, deleteImage, uploading, uploadProgress, error } = useSupabaseUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear preview local inmediato
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Subir a Supabase
    const uploadedUrl = await uploadImage(file, { folder, maxSizeMB });

    if (uploadedUrl) {
      onImageUploaded(uploadedUrl);
      // Limpiar preview local
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(uploadedUrl);
    } else {
      // Si falla, quitar preview
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(currentImageUrl);
    }
  };

  const handleRemoveImage = async () => {
    if (!previewUrl) return;

    const confirmed = window.confirm('¿Eliminar esta imagen?');
    if (!confirmed) return;

    // Si es una URL de Supabase, intentar eliminarla
    if (previewUrl.includes('supabase.co')) {
      await deleteImage(previewUrl);
    }

    setPreviewUrl(undefined);
    if (onImageRemoved) {
      onImageRemoved();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Preview de la imagen */}
      {previewUrl && (
        <div className="mb-4 relative">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-600"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Error+al+cargar';
            }}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
            disabled={uploading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Botón de selección */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={uploading}
        className={`w-full px-4 py-3 border-2 border-dashed rounded-lg transition-all ${
          uploading
            ? 'border-gray-600 bg-gray-700 cursor-not-allowed'
            : 'border-gray-600 hover:border-purple-500 hover:bg-gray-700 cursor-pointer'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <p className="text-sm text-gray-400">Subiendo... {uploadProgress}%</p>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-sm text-gray-400">
                {previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </p>
              <p className="text-xs text-gray-500">
                Máximo {maxSizeMB}MB - JPG, PNG, GIF, WEBP
              </p>
            </>
          )}
        </div>
      </button>

      {/* Mensajes de error */}
      {error && (
        <div className="mt-2 bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Información */}
      {!error && !uploading && (
        <p className="text-xs text-gray-500 mt-2">
          Las imágenes se guardan en Supabase Storage
        </p>
      )}
    </div>
  );
};

export default SupabaseImageUploader;