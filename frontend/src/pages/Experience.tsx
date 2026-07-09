import { PageWrapper } from '../components/PageWrapper';
import { SectionHeading } from '../components/SectionHeading';
import { ExperienceTimeline } from '../components/ExperienceTimeline';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { useApi } from '../hooks/useApi';
import { experiencesApi } from '../lib/api';

export function ExperiencePage() {
  const { data: experiences, loading, error, refetch } = useApi(experiencesApi.list);

  return (
    <PageWrapper>
      <div className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        <SectionHeading
          title="Experience"
          subtitle="Roles, responsibilities, and impact across AI/ML, engineering, and teaching."
          align="center"
        />
        {loading && <LoadingState message="Loading experience..." />}
        {error && <ErrorState message={error} retry={refetch} />}
        {!loading && !error && experiences && <ExperienceTimeline experiences={experiences} />}
      </div>
    </PageWrapper>
  );
}
