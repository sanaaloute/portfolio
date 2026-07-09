import { useEffect, useState } from 'react';
import { FolderKanban, Briefcase, Wrench, Newspaper } from 'lucide-react';
import { blogsApi, experiencesApi, projectsApi, skillsApi } from '../../lib/api';
import { LoadingState, ErrorState } from '../../components/LoadingState';

export function Dashboard() {
  const [counts, setCounts] = useState<{ projects: number; experiences: number; skills: number; blogs: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [projects, experiences, skills, blogs] = await Promise.all([
          projectsApi.list(),
          experiencesApi.list(),
          skillsApi.list(),
          blogsApi.list(),
        ]);
        setCounts({
          projects: projects.length,
          experiences: experiences.length,
          skills: skills.reduce((acc, g) => acc + g.items.length, 0),
          blogs: blogs.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error || !counts) return <ErrorState message={error || 'Unknown error'} />;

  const cards = [
    { label: 'Projects', value: counts.projects, icon: FolderKanban, color: 'text-accent' },
    { label: 'Experience entries', value: counts.experiences, icon: Briefcase, color: 'text-accent-2' },
    { label: 'Skills', value: counts.skills, icon: Wrench, color: 'text-emerald-400' },
    { label: 'Published blogs', value: counts.blogs, icon: Newspaper, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-text">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{card.label}</p>
                <p className="font-display text-3xl font-bold text-text">{card.value}</p>
              </div>
              <card.icon className={card.color} size={28} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
