import { useEffect, useState } from 'react';
import { experiencesApi } from '../../lib/api';
import type { Experience } from '../../lib/types';
import { LoadingState, ErrorState } from '../../components/LoadingState';
import { RichTextEditor } from '../../components/RichTextEditor';
import { ImageGallery } from '../../components/admin/ImageGallery';

const emptyExperience: Partial<Experience> = {
  company: '',
  role: '',
  slug: '',
  location: '',
  start_date: '',
  end_date: '',
  description: '',
  highlights: [],
  stack: [],
  logo_url: '',
  position: 0,
};

export function ExperienceManager() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await experiencesApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experience');
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
    const payload: Partial<Experience> = {
      company: form.get('company') as string,
      role: form.get('role') as string,
      slug: (form.get('slug') as string) || undefined,
      location: (form.get('location') as string) || null,
      start_date: form.get('start_date') as string,
      end_date: (form.get('end_date') as string) || null,
      description: editing?.description || '',
      highlights: (form.get('highlights') as string).split('\n').map((s) => s.trim()).filter(Boolean),
      stack: (form.get('stack') as string).split(',').map((s) => s.trim()).filter(Boolean),
      logo_url: (form.get('logo_url') as string) || null,
      position: Number(form.get('position') || 0),
    };
    try {
      if (editing?.slug && items.some((i) => i.slug === editing.slug)) {
        await experiencesApi.update(editing.slug, payload);
      } else {
        await experiencesApi.create(payload);
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
    if (!confirm('Delete this experience entry?')) return;
    try {
      await experiencesApi.delete(slug);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <LoadingState message="Loading experience..." />;
  if (error) return <ErrorState message={error} retry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Experience</h1>
        <button onClick={() => setEditing({ ...emptyExperience })} className="btn-primary py-2 text-xs">
          Add Experience
        </button>
      </div>

      {editing && (
        <div className="surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-text">
            {editing.id ? 'Edit Experience' : 'New Experience'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Company</label>
                <input name="company" defaultValue={editing.company} className="input" required />
              </div>
              <div>
                <label className="label">Role</label>
                <input name="role" defaultValue={editing.role} className="input" required />
              </div>
              <div>
                <label className="label">Slug (optional)</label>
                <input name="slug" defaultValue={editing.slug} className="input" />
              </div>
              <div>
                <label className="label">Location</label>
                <input name="location" defaultValue={editing.location || ''} className="input" />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input name="start_date" type="date" defaultValue={editing.start_date} className="input" required />
              </div>
              <div>
                <label className="label">End Date (leave blank for present)</label>
                <input name="end_date" type="date" defaultValue={editing.end_date || ''} className="input" />
              </div>
              <div>
                <label className="label">Stack (comma-separated)</label>
                <input name="stack" defaultValue={editing.stack?.join(', ')} className="input" />
              </div>
              <div>
                <label className="label">Position</label>
                <input name="position" type="number" defaultValue={editing.position} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Logo URL</label>
                <input
                  name="logo_url"
                  value={editing.logo_url || ''}
                  onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })}
                  className="input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <RichTextEditor value={editing.description || ''} onChange={(v) => setEditing({ ...editing, description: v })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Highlights (one per line)</label>
                <textarea name="highlights" defaultValue={editing.highlights?.join('\n')} rows={5} className="input" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary py-2 text-xs">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary py-2 text-xs">
                {saving ? 'Saving...' : 'Save Experience'}
              </button>
            </div>
          </form>
          <div className="mt-6 border-t border-border pt-4">
            <ImageGallery onSelect={(url) => setEditing({ ...editing, logo_url: url })} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((exp) => (
          <div key={exp.id} className="surface flex items-center justify-between p-4">
            <div>
              <h3 className="font-display font-semibold text-text">{exp.role} · {exp.company}</h3>
              <p className="text-xs text-text-muted">
                {exp.start_date} {exp.end_date ? `– ${exp.end_date}` : '– Present'}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(exp)} className="btn-secondary py-1.5 px-3 text-xs">
                Edit
              </button>
              <button onClick={() => handleDelete(exp.slug)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
