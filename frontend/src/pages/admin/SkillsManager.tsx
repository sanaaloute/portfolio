import { useEffect, useState } from 'react';
import { skillsApi } from '../../lib/api';
import type { SkillGroup } from '../../lib/types';
import { LoadingState, ErrorState } from '../../components/LoadingState';

export function SkillsManager() {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setGroups(await skillsApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await skillsApi.create({ category: category.trim(), name: name.trim(), position: 0 });
      setCategory('');
      setName('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add skill');
    }
  };

  // We don't have per-skill IDs exposed in list API; to delete we need the ID. 
  // For simplicity, the list endpoint returns names only. We can add a raw list later if needed.
  // Here we provide delete by fetching raw skills — we don't have that endpoint. 
  // Instead we'll expose a minimal workaround: store the skill ID isn't returned.
  // To keep the UI usable, we'll add a delete for whole category via confirmation? No.
  // Let's implement by calling a new endpoint we'll add: GET /api/skills/raw returns {id,category,name}.
  // We'll add that below. For now, this component assumes raw skills are fetched.
  const [rawSkills, setRawSkills] = useState<{ id: number; category: string; name: string }[]>([]);

  const loadRaw = async () => {
    const res = await fetch('/api/skills/raw');
    setRawSkills(await res.json());
  };

  useEffect(() => {
    loadRaw();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await skillsApi.delete(id);
      await load();
      await loadRaw();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <LoadingState message="Loading skills..." />;
  if (error) return <ErrorState message={error} retry={load} />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-text">Skills</h1>

      <form onSubmit={handleAdd} className="surface grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        <div>
          <label className="label">Category</label>
          <input list="categories" value={category} onChange={(e) => setCategory(e.target.value)} className="input" required />
          <datalist id="categories">
            {Array.from(new Set(groups.map((g) => g.category))).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label">Skill</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full py-2 text-xs">Add Skill</button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.category} className="surface p-5">
            <h3 className="mb-3 font-display font-semibold text-text">{group.category}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const raw = rawSkills.find((s) => s.category === group.category && s.name === item);
                return (
                  <span key={item} className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-3 py-1 text-xs text-text-muted">
                    {item}
                    {raw && (
                      <button onClick={() => handleDelete(raw.id)} className="ml-1 text-text-muted hover:text-red-400">×</button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
