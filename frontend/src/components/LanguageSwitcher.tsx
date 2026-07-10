import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'fr', labelKey: 'language.fr' },
  { code: 'zh', labelKey: 'language.zh' },
] as const;

function useCurrentLanguage() {
  const { i18n } = useTranslation();
  return languages.find((l) => i18n.language?.startsWith(l.code))?.code ?? 'en';
}

/** Inline row of language buttons — safe inside overflow-hidden containers (e.g. mobile menu). */
export function LanguageSwitcherInline() {
  const { i18n, t } = useTranslation();
  const current = useCurrentLanguage();
  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('language.label')}>
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => i18n.changeLanguage(l.code)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase transition ${
            current === l.code ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text'
          }`}
          aria-pressed={current === l.code}
        >
          {l.code}
        </button>
      ))}
    </div>
  );
}

/** Compact Globe-icon dropdown for the desktop navbar. */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = useCurrentLanguage();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const change = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-secondary flex items-center gap-1.5 py-2 text-xs"
        aria-label={t('language.label')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe size={14} />
        <span className="uppercase">{current}</span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-xl">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitem"
              onClick={() => change(l.code)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-bg ${
                current === l.code ? 'text-text' : 'text-text-muted'
              }`}
            >
              <span>{t(l.labelKey)}</span>
              {current === l.code && <Check size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
