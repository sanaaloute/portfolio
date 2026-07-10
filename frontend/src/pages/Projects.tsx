import { PageWrapper } from '../components/PageWrapper';
import { ProjectCard } from '../components/ProjectCard';
import { SectionHeading } from '../components/SectionHeading';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { useApi } from '../hooks/useApi';
import { projectsApi } from '../lib/api';
import { useTranslation } from 'react-i18next';

export function Projects() {
  const { t } = useTranslation();
  const { data: projects, loading, error, refetch } = useApi(projectsApi.list);

  return (
    <PageWrapper>
      <div className="mx-auto max-w-6xl px-6 pt-32 pb-24">
        <SectionHeading
          title={t('projects.title')}
          align="center"
        />
        {loading && <LoadingState message={t('projects.loading')} />}
        {error && <ErrorState message={error} retry={refetch} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
        {!loading && !error && projects?.length === 0 && (
          <p className="py-12 text-center text-text-muted">{t('projects.empty')}</p>
        )}
      </div>
    </PageWrapper>
  );
}
