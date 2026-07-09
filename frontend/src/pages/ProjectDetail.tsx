import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { SafeHtml } from '../components/SafeHtml';
import { useApi } from '../hooks/useApi';
import { projectsApi } from '../lib/api';

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, loading, error, refetch } = useApi(
    () => projectsApi.get(slug!),
    [slug]
  );

  if (loading) return <LoadingState message="Loading project..." />;
  if (error || !project) return <ErrorState message={error || 'Project not found'} retry={refetch} />;

  return (
    <PageWrapper>
      <div className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <Link to="/projects" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
          <ArrowLeft size={16} /> Back to projects
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-3xl font-bold text-text md:text-5xl">{project.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {project.period}</span>
            {project.location && <span className="flex items-center gap-1.5"><MapPin size={14} /> {project.location}</span>}
          </div>

          {project.cover_url && (
            <div className="mt-8 overflow-hidden rounded-3xl">
              <img src={project.cover_url} alt={project.title} className="w-full object-cover" />
            </div>
          )}

          <div className="mt-8 surface p-6 md:p-8">
            <p className="text-lg leading-relaxed text-text-muted">{project.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span key={tech} className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium text-text-muted">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <SafeHtml html={project.body} className="prose-content" />
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
