import { PageWrapper } from '../components/PageWrapper';
import { ProjectCard } from '../components/ProjectCard';
import { SectionHeading } from '../components/SectionHeading';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { useApi } from '../hooks/useApi';
import { projectsApi } from '../lib/api';

export function Projects() {
  const { data: projects, loading, error, refetch } = useApi(projectsApi.list);

  return (
    <PageWrapper>
      <div className="mx-auto max-w-6xl px-6 pt-32 pb-24">
        <SectionHeading
          title="Projects"
          subtitle="A selection of shipped products, experiments, and open-source work."
          align="center"
        />
        {loading && <LoadingState message="Loading projects..." />}
        {error && <ErrorState message={error} retry={refetch} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
        {!loading && !error && projects?.length === 0 && (
          <p className="py-12 text-center text-text-muted">No projects yet. Check back soon.</p>
        )}
      </div>
    </PageWrapper>
  );
}
