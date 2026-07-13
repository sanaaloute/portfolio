import { GraduationCap, Award, ExternalLink } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { SectionHeading } from '../components/SectionHeading';
import { ExperienceTimeline } from '../components/ExperienceTimeline';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { useApi } from '../hooks/useApi';
import { experiencesApi, educationApi, certificationsApi } from '../lib/api';
import { useTranslation } from 'react-i18next';

function formatPeriod(start: string, end: string | null, present: string) {
  const startYear = new Date(start).getFullYear();
  return end ? `${startYear} – ${new Date(end).getFullYear()}` : `${startYear} – ${present}`;
}

export function ExperiencePage() {
  const { t } = useTranslation();
  const { data: experiences, loading, error, refetch } = useApi(experiencesApi.list);
  const { data: education } = useApi(educationApi.list);
  const { data: certifications } = useApi(certificationsApi.list);

  return (
    <PageWrapper>
      <div className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        <SectionHeading
          title={t('experience.title')}
          align="center"
        />
        {loading && <LoadingState message={t('experience.loading')} />}
        {error && <ErrorState message={error} retry={refetch} />}
        {!loading && !error && experiences && <ExperienceTimeline experiences={experiences} />}

        {/* Education */}
        {education && education.length > 0 && (
          <section className="mt-24">
            <SectionHeading title={t('education.title')} align="center" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {education.map((edu) => (
                <div key={edu.id} className="surface flex gap-4 p-6">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-accent">
                      {formatPeriod(edu.start_date, edu.end_date, t('common.present'))}
                    </span>
                    <h3 className="mt-1 font-display text-base font-semibold text-text">{edu.degree}</h3>
                    <p className="text-sm text-text-muted">{edu.institution}</p>
                    {edu.description && (
                      <p className="mt-2 text-sm leading-relaxed text-text-muted">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section className="mt-24">
            <SectionHeading title={t('certifications.title')} align="center" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {certifications.map((cert) => {
                const card = (
                  <div className="surface flex h-full gap-4 p-6 transition hover:border-border-strong">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-2/10 text-accent-2">
                      <Award size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-text-muted">{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</p>
                      <h3 className="mt-1 text-sm font-semibold text-text">{cert.name}</h3>
                    </div>
                    {cert.url && <ExternalLink size={16} className="flex-shrink-0 text-text-muted" />}
                  </div>
                );
                return cert.url ? (
                  <a key={cert.id} href={cert.url} target="_blank" rel="noreferrer" className="block h-full">
                    {card}
                  </a>
                ) : (
                  <div key={cert.id}>{card}</div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
