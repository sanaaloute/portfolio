import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Hero } from '../components/Hero';
import { FocusAreaCard } from '../components/FocusAreaCard';
import { ProjectCard } from '../components/ProjectCard';
import { ExperienceTimeline } from '../components/ExperienceTimeline';
import { SkillGroup } from '../components/SkillGroup';
import { SectionHeading } from '../components/SectionHeading';
import { useApi } from '../hooks/useApi';
import { experiencesApi, profileApi, projectsApi, skillsApi } from '../lib/api';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { PageWrapper } from '../components/PageWrapper';

export function Home() {
  const { data: profile, loading: pLoading, error: pError } = useApi(profileApi.get);
  const { data: projects, loading: prLoading } = useApi(projectsApi.list);
  const { data: experiences, loading: eLoading } = useApi(experiencesApi.list);
  const { data: skills, loading: sLoading } = useApi(skillsApi.list);

  if (pLoading) return <LoadingState message="Loading..." />;
  if (pError || !profile) return <ErrorState message={pError || 'Failed to load profile'} />;

  const featuredProjects = (projects || []).filter((p) => p.featured).slice(0, 3);
  const latestExperiences = (experiences || []).slice(0, 3);

  return (
    <PageWrapper>
      <Hero profile={profile} />

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* Focus Areas */}
        <section className="py-16">
          <SectionHeading title="Focus Areas" subtitle="Where I spend most of my engineering energy." align="center" />
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
              title="Featured Projects"
              subtitle="A few things I've built recently."
              action={
                <Link to="/projects" className="btn-secondary py-2 text-xs">
                  View all <ArrowRight size={14} />
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
              title="Experience"
              subtitle="My professional journey so far."
              action={
                <Link to="/experience" className="btn-secondary py-2 text-xs">
                  View all <ArrowRight size={14} />
                </Link>
              }
            />
            <ExperienceTimeline experiences={latestExperiences} />
          </section>
        )}

        {/* Skills */}
        {!sLoading && skills && skills.length > 0 && (
          <section className="py-16">
            <SectionHeading title="Skills & Technologies" subtitle="Tools and technologies I use to ship products." align="center" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((group, i) => (
                <SkillGroup key={group.category} group={group} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <section className="py-16">
          <div className="surface relative overflow-hidden p-8 text-center md:p-14">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-accent-2/10" />
            <div className="relative">
              <h2 className="font-display text-2xl font-bold text-text md:text-3xl">Let&apos;s build something great.</h2>
              <p className="mx-auto mt-3 max-w-lg text-text-muted">
                Open to collaborations, consulting, and full-time opportunities in AI/ML and full-stack engineering.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="btn-primary">
                  Get in touch
                </Link>
                <Link to="/projects" className="btn-secondary">
                  See my work
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
