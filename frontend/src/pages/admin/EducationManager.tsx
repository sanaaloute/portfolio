import { useEffect, useState } from 'react';
import { educationApi } from '../../lib/api';
import type { Education } from '../../lib/types';
import { LoadingState, ErrorState } from '../../components/LoadingState';

const emptyEducation: Partial<Education> = {
  institution: '',
  degree: '',
  slug: '',
  location: '',
  start_date: '',
  end_date: '',
  description: '',
  position: 0,
};

export function EducationManager() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Education> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await educationApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load education');
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
    const payload: Partial<Education> = {
      institution: form.get('institution') as string,
      degree: form.get('degree') as string,
      slug: (form.get('slug') as string) || undefined,
      location: (form.get('location') as string) || null,
      start_date: form.get('start_date') as string,
      end_date: (form.get('end_date') as string) || null,
      description: (form.get('description') as string) || null,
      position: Number(form.get('position') || 0),
    };
    try {
      if (editing?.slug && items.some((i) => i.slug === editing.slug)) {
        await educationApi.update(editing.slug, payload);
      } else {
        await educationApi.create(payload);
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
    if (!confirm('Delete this education entry?')) return;
    try {
      await educationApi.delete(slug);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <LoadingState message="Loading education..." />;
  if (error) return <ErrorState message={error} retry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Education</h1>
        <button onClick={() => setEditing({ ...emptyEducation })} className="btn-primary py-2 text-xs">
          Add Education
        </button>
      </div>

      {editing && (
        <div className="surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-text">
            {editing.id ? 'Edit Education' : 'New Education'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Institution</label>
                <input name="institution" defaultValue={editing.institution} className="input" required />
              </div>
              <div>
                <label className="label">Degree</label>
                <input name="degree" defaultValue={editing.degree} className="input" required />
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
                <label className="label">Position</label>
                <input name="position" type="number" defaultValue={editing.position} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description (research / graduation topic)</label>
                <textarea name="description" defaultValue={editing.description || ''} rows={3} className="input" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary py-2 text-xs">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary py-2 text-xs">
                {saving ? 'Saving...' : 'Save Education'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {items.map((edu) => (
          <div key={edu.id} className="surface flex items-center justify-between p-4">
            <div>
              <h3 className="font-display font-semibold text-text">{edu.degree}</h3>
              <p className="text-xs text-text-muted">
                {edu.institution} · {edu.start_date} {edu.end_date ? `– ${edu.end_date}` : '– Present'}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(edu)} className="btn-secondary py-1.5 px-3 text-xs">
                Edit
              </button>
              <button onClick={() => handleDelete(edu.slug)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
