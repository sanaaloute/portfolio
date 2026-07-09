import { Mail, MapPin, Github, Linkedin, ArrowUpRight } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { SectionHeading } from '../components/SectionHeading';
import { useApi } from '../hooks/useApi';
import { profileApi } from '../lib/api';
import { LoadingState, ErrorState } from '../components/LoadingState';

export function Contact() {
  const { data: profile, loading, error } = useApi(profileApi.get);

  if (loading) return <LoadingState message="Loading..." />;
  if (error || !profile) return <ErrorState message={error || 'Failed to load profile'} />;

  const links = [
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: Github, label: 'GitHub', value: profile.github?.replace('https://', ''), href: profile.github },
    { icon: Linkedin, label: 'LinkedIn', value: profile.linkedin?.replace('https://', ''), href: profile.linkedin },
  ].filter((l) => l.value);

  return (
    <PageWrapper>
      <div className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <SectionHeading
          title="Get in Touch"
          subtitle="Have a project, opportunity, or just want to say hi? I'd love to hear from you."
          align="center"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href || '#'}
              target="_blank"
              rel="noreferrer"
              className="group surface flex items-center justify-between p-6 transition hover:border-border-strong"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <link.icon size={18} />
                </div>
                <div>
                  <p className="text-sm text-text-muted">{link.label}</p>
                  <p className="font-medium text-text">{link.value}</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-text-muted transition group-hover:text-text" />
            </a>
          ))}

          {profile.location && (
            <div className="surface flex items-center gap-4 p-6 md:col-span-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-2/10 text-accent-2">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-sm text-text-muted">Location</p>
                <p className="font-medium text-text">{profile.location}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 surface p-6 md:p-8">
          <h3 className="font-display text-lg font-semibold text-text">Send a message</h3>
          <form
            action={`mailto:${profile.email}`}
            method="post"
            encType="text/plain"
            className="mt-5 space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input name="name" placeholder="Your name" className="input" required />
              <input name="email" type="email" placeholder="Your email" className="input" required />
            </div>
            <textarea name="message" placeholder="Your message" rows={5} className="input" required />
            <button type="submit" className="btn-primary">
              <Mail size={16} /> Open email client
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
