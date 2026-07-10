import { useEffect, useState } from 'react';
import { blogsApi } from '../../lib/api';
import type { Blog } from '../../lib/types';
import { LoadingState, ErrorState } from '../../components/LoadingState';
import { RichTextEditor } from '../../components/RichTextEditor';
import { ImageGallery } from '../../components/admin/ImageGallery';

const emptyBlog: Partial<Blog> = {
  title: '',
  slug: '',
  summary: '',
  body: '',
  cover_url: '',
  published: false,
};

export function BlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Blog> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setBlogs(await blogsApi.listAll());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
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
    const payload: Partial<Blog> = {
      title: form.get('title') as string,
      slug: (form.get('slug') as string) || undefined,
      summary: (form.get('summary') as string) || null,
      body: editing?.body || '',
      cover_url: (form.get('cover_url') as string) || null,
      published: form.has('published'),
    };
    try {
      if (editing?.slug && blogs.some((b) => b.slug === editing.slug)) {
        await blogsApi.update(editing.slug, payload);
      } else {
        await blogsApi.create(payload);
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
    if (!confirm('Delete this blog post?')) return;
    try {
      await blogsApi.delete(slug);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) return <LoadingState message="Loading blog posts..." />;
  if (error) return <ErrorState message={error} retry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Blog</h1>
        <button onClick={() => setEditing({ ...emptyBlog })} className="btn-primary py-2 text-xs">
          Add Post
        </button>
      </div>

      {editing && (
        <div className="surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-text">
            {editing.id ? 'Edit Post' : 'New Post'}
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
                <label className="label">Cover URL</label>
                <input
                  name="cover_url"
                  value={editing.cover_url || ''}
                  onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input name="published" type="checkbox" defaultChecked={editing.published} className="h-4 w-4 accent-accent" />
                  Published
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="label">Summary</label>
                <textarea name="summary" defaultValue={editing.summary || ''} rows={3} className="input" />
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
                {saving ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>
          <div className="mt-6 border-t border-border pt-4">
            <ImageGallery onSelect={(url) => setEditing({ ...editing, cover_url: url })} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {blogs.map((blog) => (
          <div key={blog.id} className="surface flex items-center justify-between p-4">
            <div>
              <h3 className="font-display font-semibold text-text">{blog.title}</h3>
              <p className="text-xs text-text-muted">{blog.published ? 'Published' : 'Draft'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(blog)} className="btn-secondary py-1.5 px-3 text-xs">
                Edit
              </button>
              <button onClick={() => handleDelete(blog.slug)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
