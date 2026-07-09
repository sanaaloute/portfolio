import { useEffect, useState } from 'react';
import { Trash, Copy, ImageIcon } from 'lucide-react';
import { uploadApi } from '../../lib/api';
import type { UploadedImage } from '../../lib/types';
import { ErrorState, LoadingState } from '../LoadingState';

interface ImageGalleryProps {
  onSelect?: (url: string) => void;
}

export function ImageGallery({ onSelect }: ImageGalleryProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadApi.list();
      setImages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadApi.upload(file);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await uploadApi.delete(filename);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
  };

  if (loading) return <LoadingState message="Loading uploads..." />;
  if (error) return <ErrorState message={error} retry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="btn-secondary cursor-pointer py-2 text-xs">
          {uploading ? 'Uploading...' : 'Upload image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center py-12 text-text-muted">
          <ImageIcon size={32} className="mb-2 opacity-50" />
          <p className="text-sm">No uploads yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.filename} className="surface group overflow-hidden p-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-2">
                <img src={img.url} alt={img.filename} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-bg/70 opacity-0 transition group-hover:opacity-100">
                  {onSelect && (
                    <button onClick={() => onSelect(img.url)} className="rounded-full bg-accent p-2 text-white hover:bg-accent/90">
                      <Copy size={14} />
                    </button>
                  )}
                  <button onClick={() => copyUrl(img.url)} className="rounded-full bg-surface p-2 text-text hover:bg-surface-2">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleDelete(img.filename)} className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-2 truncate text-[10px] text-text-muted">{img.filename}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
