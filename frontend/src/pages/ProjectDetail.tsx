import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '../components/PageWrapper';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { SafeHtml } from '../components/SafeHtml';
import { useApi } from '../hooks/useApi';
import { projectsApi } from '../lib/api';

export function ProjectDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: project, loading, error, refetch } = useApi(
    () => projectsApi.get(slug!),
    [slug]
  );

  if (loading) return <LoadingState message={t('projectDetail.loading')} />;
  if (error || !project) return <ErrorState message={error || t('projectDetail.notFound')} retry={refetch} />;

  return (
    <PageWrapper>
      <div className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <Link to="/projects" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
          <ArrowLeft size={16} /> {t('projectDetail.back')}
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

          {project.demo_url && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-lg font-semibold text-text">{t('projectDetail.demo')}</h2>
              <video controls preload="metadata" className="w-full overflow-hidden rounded-3xl bg-black">
                <source src={project.demo_url} />
              </video>
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

          {project.images && project.images.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-display text-lg font-semibold text-text">{t('projectDetail.gallery')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {project.images.map((img, i) => (
                  <figure key={i} className="surface overflow-hidden">
                    <img src={img.url} alt={img.caption || project.title} className="w-full object-cover" loading="lazy" />
                    {img.caption && (
                      <figcaption className="px-4 py-2 text-xs text-text-muted">{img.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
