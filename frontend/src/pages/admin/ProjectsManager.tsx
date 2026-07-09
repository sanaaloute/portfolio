import { useEffect, useState } from 'react';
import { projectsApi } from '../../lib/api';
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
  featured: false,
  position: 0,
};

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);

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
            <ImageGallery onSelect={(url) => setEditing({ ...editing, cover_url: url })} />
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
