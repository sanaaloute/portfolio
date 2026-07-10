import { Github, Linkedin, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { profileApi } from '../lib/api';

export function Footer() {
  const { data: profile } = useApi(profileApi.get);
  const { t } = useTranslation();

  const socials = [
    { icon: Github, href: profile?.github || '#', label: t('footer.github') },
    { icon: Linkedin, href: profile?.linkedin || '#', label: t('footer.linkedin') },
    { icon: Mail, href: profile?.email ? `mailto:${profile.email}` : '#', label: t('footer.email') },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <p className="text-sm text-text-muted">
          {t('footer.rights', { year: new Date().getFullYear(), name: profile?.name || 'Aloute Sana' })}
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
