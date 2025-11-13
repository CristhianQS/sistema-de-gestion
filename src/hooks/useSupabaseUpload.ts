import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadOptions {
  folder?: string;
  maxSizeMB?: number;
}

export const useSupabaseUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<string | null> => {
    const { folder = 'uploads', maxSizeMB = 5 } = options;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validar tamaño
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`La imagen debe ser menor a ${maxSizeMB}MB`);
      }

      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      setUploadProgress(30);

      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(70);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      setUploading(false);

      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Error al subir imagen:', err);
      setError(err.message || 'Error al subir la imagen');
      setUploading(false);
      return null;
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extraer el path de la URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/images/');
      if (pathParts.length < 2) {
        throw new Error('URL inválida');
      }

      const filePath = pathParts[1];

      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (err: any) {
      console.error('Error al eliminar imagen:', err);
      setError(err.message || 'Error al eliminar la imagen');
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    uploadProgress,
    error,
  };
};