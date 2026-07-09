import { Github, Linkedin, Mail } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { profileApi } from '../lib/api';

export function Footer() {
  const { data: profile } = useApi(profileApi.get);

  const socials = [
    { icon: Github, href: profile?.github || '#', label: 'GitHub' },
    { icon: Linkedin, href: profile?.linkedin || '#', label: 'LinkedIn' },
    { icon: Mail, href: profile?.email ? `mailto:${profile.email}` : '#', label: 'Email' },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} {profile?.name || 'Aloute Sana'}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="text-text-muted transition hover:text-text"
              aria-label={s.label}
            >
              <s.icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
