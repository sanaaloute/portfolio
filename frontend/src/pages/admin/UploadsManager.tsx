import { ImageGallery } from '../../components/admin/ImageGallery';

export function UploadsManager() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-text">Uploads</h1>
      <ImageGallery />
    </div>
  );
}
