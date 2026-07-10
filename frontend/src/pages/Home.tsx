import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Hero } from '../components/Hero';
import { FocusAreaCard } from '../components/FocusAreaCard';
import { ProjectCard } from '../components/ProjectCard';
import { ExperienceTimeline } from '../components/ExperienceTimeline';
import { SkillGroup } from '../components/SkillGroup';
import { SectionHeading } from '../components/SectionHeading';

import { useApi } from '../hooks/useApi';
import { blogsApi, experiencesApi, profileApi, projectsApi, skillsApi } from '../lib/api';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { PageWrapper } from '../components/PageWrapper';

export function Home() {
  const { t } = useTranslation();
  const { data: profile, loading: pLoading, error: pError } = useApi(profileApi.get);
  const { data: projects, loading: prLoading } = useApi(projectsApi.list);
  const { data: experiences, loading: eLoading } = useApi(experiencesApi.list);
  const { data: skills, loading: sLoading } = useApi(skillsApi.list);
  const { data: blogs } = useApi(blogsApi.list);

  if (pLoading) return <LoadingState />;
  if (pError || !profile) return <ErrorState message={pError || t('home.failedProfile')} />;

  const featuredProjects = (projects || []).filter((p) => p.featured).slice(0, 3);
  const latestExperiences = (experiences || []).slice(0, 3);
  const latestBlogs = (blogs || []).slice(0, 3);

  return (
    <PageWrapper>
      <Hero profile={profile} />

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* Focus Areas */}
        <section className="py-16">
          <SectionHeading title={t('home.focusAreas')} align="center" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {profile.focus_areas.map((area, i) => (
              <FocusAreaCard key={area.title} title={area.title} description={area.description} index={i} />
            ))}
          </div>
        </section>

        {/* Featured Projects */}
        {!prLoading && featuredProjects.length > 0 && (
          <section className="py-16">
            <SectionHeading
              title={t('home.featuredProjects')}
              action={
                <Link to="/projects" className="btn-secondary py-2 text-xs">
                  {t('common.viewAll')} <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {!eLoading && latestExperiences.length > 0 && (
          <section className="py-16">
            <SectionHeading
              title={t('home.experience')}
              action={
                <Link to="/experience" className="btn-secondary py-2 text-xs">
                  {t('common.viewAll')} <ArrowRight size={14} />
                </Link>
              }
            />
            <ExperienceTimeline experiences={latestExperiences} />
          </section>
        )}

        {/* Skills */}
        {!sLoading && skills && skills.length > 0 && (
          <section className="py-16">
            <SectionHeading title={t('home.skills')} align="center" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((group, i) => (
                <SkillGroup key={group.category} group={group} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Blog */}
        {latestBlogs.length > 0 && (
          <section className="py-16">
            <SectionHeading
              title={t('home.blog')}
              action={
                <Link to="/blog" className="btn-secondary py-2 text-xs">
                  {t('common.viewAll')} <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestBlogs.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="block h-full">
                  <div className="surface flex h-full flex-col overflow-hidden">
                    {post.cover_url && (
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="h-40 w-full object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-semibold text-text">{post.title}</h3>
                      {post.summary && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                          {post.summary}
                        </p>
                      )}
                      <span className="mt-4 text-sm font-medium text-accent">
                        {t('blog.readMore')} <ArrowRight size={14} className="inline" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <section className="py-16">
          <div className="surface relative overflow-hidden p-8 text-center md:p-14">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-accent-2/10" />
            <div className="relative">
              <h2 className="font-display text-2xl font-bold text-text md:text-3xl">{t('home.ctaTitle')}</h2>
              <p className="mx-auto mt-3 max-w-lg text-text-muted">
                {t('home.ctaSubtitle')}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="btn-primary">
                  {t('home.getInTouch')}
                </Link>
                <Link to="/projects" className="btn-secondary">
                  {t('home.seeMyWork')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
