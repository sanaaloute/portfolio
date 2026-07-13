import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { profileApi, uploadApi } from '../../lib/api';
import type { Profile } from '../../lib/types';
import { LoadingState, ErrorState } from '../../components/LoadingState';
import { RichTextEditor } from '../../components/RichTextEditor';

export function ProfileEditor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [cvUploading, setCvUploading] = useState(false);

  const [statsJson, setStatsJson] = useState('[]');
  const [focusJson, setFocusJson] = useState('[]');
  const [socialsJson, setSocialsJson] = useState('[]');

  useEffect(() => {
    profileApi
      .get()
      .then((p) => {
        setProfile(p);
        setResumeUrl(p.resume_url || '');
        setStatsJson(JSON.stringify(p.hero_stats, null, 2));
        setFocusJson(JSON.stringify(p.focus_areas, null, 2));
        setSocialsJson(JSON.stringify(p.socials || [], null, 2));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvUploading(true);
    setError(null);
    try {
      const res = await uploadApi.uploadResume(file);
      setResumeUrl(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setCvUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const form = new FormData(e.currentTarget);
      const payload: Partial<Profile> = {
        name: form.get('name') as string,
        headline: form.get('headline') as string,
        tagline: form.get('tagline') as string,
        bio: profile?.bio || '',
        avatar_url: (form.get('avatar_url') as string) || null,
        resume_url: (form.get('resume_url') as string) || null,
        phone: (form.get('phone') as string) || null,
        location: (form.get('location') as string) || null,
        email: form.get('email') as string,
        github: (form.get('github') as string) || null,
        linkedin: (form.get('linkedin') as string) || null,
        twitter: (form.get('twitter') as string) || null,
        hero_stats: JSON.parse(statsJson),
        focus_areas: JSON.parse(focusJson),
        socials: JSON.parse(socialsJson),
      };
      await profileApi.update(payload);
      setMessage('Profile saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading profile..." />;
  if (error || !profile) return <ErrorState message={error || 'Unknown error'} />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-text">Edit Profile</h1>
      {message && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      <form onSubmit={handleSave} className="surface space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input name="name" defaultValue={profile.name} className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" defaultValue={profile.email} className="input" required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Headline</label>
            <input name="headline" defaultValue={profile.headline} className="input" required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Tagline</label>
            <input name="tagline" defaultValue={profile.tagline} className="input" required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Bio</label>
            <RichTextEditor value={profile.bio} onChange={(v) => setProfile({ ...profile, bio: v })} />
          </div>
          <div>
            <label className="label">Avatar URL</label>
            <input name="avatar_url" defaultValue={profile.avatar_url || ''} className="input" />
          </div>
          <div>
            <label className="label">Resume (CV)</label>
            <input
              name="resume_url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://... or upload a file"
              className="input"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="btn-secondary cursor-pointer py-2 text-xs">
                <Upload size={14} />
                {cvUploading ? 'Uploading...' : 'Upload CV'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  className="hidden"
                  onChange={handleCvUpload}
                  disabled={cvUploading}
                />
              </label>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                  View current CV
                </a>
              )}
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" defaultValue={profile.phone || ''} className="input" />
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" defaultValue={profile.location || ''} className="input" />
          </div>
          <div>
            <label className="label">GitHub</label>
            <input name="github" defaultValue={profile.github || ''} className="input" />
          </div>
          <div>
            <label className="label">LinkedIn</label>
            <input name="linkedin" defaultValue={profile.linkedin || ''} className="input" />
          </div>
          <div>
            <label className="label">Twitter</label>
            <input name="twitter" defaultValue={profile.twitter || ''} className="input" />
          </div>
          <div>
            <label className="label">Hero Stats (JSON)</label>
            <textarea value={statsJson} onChange={(e) => setStatsJson(e.target.value)} rows={5} className="input font-mono text-xs" />
          </div>
          <div>
            <label className="label">Focus Areas (JSON)</label>
            <textarea value={focusJson} onChange={(e) => setFocusJson(e.target.value)} rows={5} className="input font-mono text-xs" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Social Links (JSON)</label>
            <textarea value={socialsJson} onChange={(e) => setSocialsJson(e.target.value)} rows={4} className="input font-mono text-xs" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
