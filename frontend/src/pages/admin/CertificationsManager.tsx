import { useEffect, useState } from 'react';
import { certificationsApi } from '../../lib/api';
import type { Certification } from '../../lib/types';
import { LoadingState, ErrorState } from '../../components/LoadingState';

const emptyCertification: Partial<Certification> = {
  name: '',
  issuer: '',
  slug: '',
  year: '',
  url: '',
  position: 0,
};

export function CertificationsManager() {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Certification> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await certificationsApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certifications');
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
    const payload: Partial<Certification> = {
      name: form.get('name') as string,
      issuer: form.get('issuer') as string,
      slug: (form.get('slug') as string) || undefined,
      year: (form.get('year') as string) || null,
      url: (form.get('url') as string) || null,
      position: Number(form.get('position') || 0),
    };
    try {
      if (editing?.slug && items.some((i) => i.slug === editing.slug)) {
        await certificationsApi.update(editing.slug, payload);
      } else {
        await certificationsApi.create(payload);
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
    if (!confirm('Delete this certification?')) return;
    try {
      await certificationsApi.delete(slug);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <LoadingState message="Loading certifications..." />;
  if (error) return <ErrorState message={error} retry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Certifications</h1>
        <button onClick={() => setEditing({ ...emptyCertification })} className="btn-primary py-2 text-xs">
          Add Certification
        </button>
      </div>

      {editing && (
        <div className="surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-text">
            {editing.id ? 'Edit Certification' : 'New Certification'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input name="name" defaultValue={editing.name} className="input" required />
              </div>
              <div>
                <label className="label">Issuer</label>
                <input name="issuer" defaultValue={editing.issuer} className="input" required />
              </div>
              <div>
                <label className="label">Slug (optional)</label>
                <input name="slug" defaultValue={editing.slug} className="input" />
              </div>
              <div>
                <label className="label">Year (optional)</label>
                <input name="year" defaultValue={editing.year || ''} className="input" />
              </div>
              <div>
                <label className="label">Credential URL (optional)</label>
                <input name="url" defaultValue={editing.url || ''} className="input" />
              </div>
              <div>
                <label className="label">Position</label>
                <input name="position" type="number" defaultValue={editing.position} className="input" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary py-2 text-xs">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary py-2 text-xs">
                {saving ? 'Saving...' : 'Save Certification'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {items.map((cert) => (
          <div key={cert.id} className="surface flex items-center justify-between p-4">
            <div>
              <h3 className="font-display font-semibold text-text">{cert.name}</h3>
              <p className="text-xs text-text-muted">{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(cert)} className="btn-secondary py-1.5 px-3 text-xs">
                Edit
              </button>
              <button onClick={() => handleDelete(cert.slug)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
