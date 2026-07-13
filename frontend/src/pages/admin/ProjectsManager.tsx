import { useEffect, useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import { projectsApi, uploadApi } from '../../lib/api';
import type { Project } from '../../lib/types';
import { LoadingState, ErrorState } from '../../components/LoadingState';
import { RichTextEditor } from '../../components/RichTextEditor';
import { ImageGallery } from '../../components/admin/ImageGallery';

const emptyProject: Partial<Project> = {
  title: '',
  slug: '',
  summary: '',
  body: '',
  period: '',
  location: '',
  stack: [],
  cover_url: '',
  demo_url: '',
  images: [],
  featured: false,
  position: 0,
};

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setProjects(await projectsApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload: Partial<Project> = {
      title: form.get('title') as string,
      slug: (form.get('slug') as string) || undefined,
      summary: form.get('summary') as string,
      body: editing?.body || '',
      period: form.get('period') as string,
      location: (form.get('location') as string) || null,
      stack: (form.get('stack') as string).split(',').map((s) => s.trim()).filter(Boolean),
      cover_url: (form.get('cover_url') as string) || null,
      demo_url: editing?.demo_url || null,
      images: editing?.images || [],
      featured: form.has('featured'),
      position: Number(form.get('position') || 0),
    };
    try {
      if (editing?.slug && projects.some((p) => p.slug === editing.slug)) {
        await projectsApi.update(editing.slug, payload);
      } else {
        await projectsApi.create(payload);
      }
      setEditing(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await projectsApi.delete(slug);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setVideoUploading(true);
    try {
      const res = await uploadApi.uploadVideo(file);
      setEditing({ ...editing, demo_url: res.url });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Video upload failed');
    } finally {
      setVideoUploading(false);
      e.target.value = '';
    }
  };

  const addGalleryImage = (url: string) => {
    if (!editing) return;
    const images = editing.images || [];
    if (images.some((img) => img.url === url)) return;
    setEditing({ ...editing, images: [...images, { url, caption: '' }] });
  };

  const updateGalleryCaption = (index: number, caption: string) => {
    if (!editing?.images) return;
    const images = editing.images.map((img, i) => (i === index ? { ...img, caption } : img));
    setEditing({ ...editing, images });
  };

  const removeGalleryImage = (index: number) => {
    if (!editing?.images) return;
    setEditing({ ...editing, images: editing.images.filter((_, i) => i !== index) });
  };

  if (loading) return <LoadingState message="Loading projects..." />;
  if (error) return <ErrorState message={error} retry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Projects</h1>
        <button onClick={() => setEditing({ ...emptyProject })} className="btn-primary py-2 text-xs">
          Add Project
        </button>
      </div>

      {editing && (
        <div className="surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-text">
            {editing.id ? 'Edit Project' : 'New Project'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">Title</label>
                <input name="title" defaultValue={editing.title} className="input" required />
              </div>
              <div>
                <label className="label">Slug (optional)</label>
                <input name="slug" defaultValue={editing.slug} className="input" />
              </div>
              <div>
                <label className="label">Period</label>
                <input name="period" defaultValue={editing.period} className="input" required />
              </div>
              <div>
                <label className="label">Location</label>
                <input name="location" defaultValue={editing.location || ''} className="input" />
              </div>
              <div>
                <label className="label">Stack (comma-separated)</label>
                <input name="stack" defaultValue={editing.stack?.join(', ')} className="input" />
              </div>
              <div>
                <label className="label">Cover URL</label>
                <input
                  name="cover_url"
                  value={editing.cover_url || ''}
                  onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input name="featured" type="checkbox" defaultChecked={editing.featured} className="h-4 w-4 accent-accent" />
                  Featured
                </label>
                <div className="flex-1">
                  <label className="label">Position</label>
                  <input name="position" type="number" defaultValue={editing.position} className="input" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label">Demo Video URL</label>
                <input
                  name="demo_url"
                  value={editing.demo_url || ''}
                  onChange={(e) => setEditing({ ...editing, demo_url: e.target.value })}
                  placeholder="/uploads/....mp4 or external URL"
                  className="input"
                />
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="btn-secondary cursor-pointer py-2 text-xs">
                    <Upload size={14} />
                    {videoUploading ? 'Uploading...' : 'Upload video (mp4/webm/mov, max 50MB)'}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={handleVideoUpload}
                      disabled={videoUploading}
                    />
                  </label>
                  {editing.demo_url && (
                    <a href={editing.demo_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                      Preview current video
                    </a>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label">Summary</label>
                <textarea name="summary" defaultValue={editing.summary} rows={3} className="input" required />
              </div>
              <div className="md:col-span-2">
                <label className="label">Body</label>
                <RichTextEditor value={editing.body || ''} onChange={(v) => setEditing({ ...editing, body: v })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary py-2 text-xs">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary py-2 text-xs">
                {saving ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </form>
          <div className="mt-6 border-t border-border pt-4">
            <label className="label">Gallery Images ({editing.images?.length || 0})</label>
            {editing.images && editing.images.length > 0 && (
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {editing.images.map((img, i) => (
                  <div key={i} className="surface flex items-center gap-3 p-2">
                    <img src={img.url} alt={img.caption || ''} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                    <input
                      value={img.caption || ''}
                      onChange={(e) => updateGalleryCaption(i, e.target.value)}
                      placeholder="Caption (optional)"
                      className="input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, cover_url: img.url })}
                      title="Set as cover"
                      className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-accent"
                    >
                      <Star size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      title="Remove"
                      className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mb-2 text-xs text-text-muted">Click an uploaded image to add it to the gallery.</p>
            <ImageGallery onSelect={addGalleryImage} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="surface flex items-center justify-between p-4">
            <div>
              <h3 className="font-display font-semibold text-text">{project.title}</h3>
              <p className="text-xs text-text-muted">{project.period} · {project.stack.slice(0, 4).join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(project)} className="btn-secondary py-1.5 px-3 text-xs">
                Edit
              </button>
              <button onClick={() => handleDelete(project.slug)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
