// Locale-aware CV download. The PDFs live in frontend/public and are served
// at the web root by nginx/Vite. `profile.resume_url` (admin-uploaded) takes
// precedence when set.

export const RESUME_EN = '/resume-en.pdf';
export const RESUME_ZH = '/resume-zh.pdf';

export function getResumeUrl(lang: string | undefined, override?: string | null): string {
  if (override) return override;
  return lang && lang.toLowerCase().startsWith('zh') ? RESUME_ZH : RESUME_EN;
}

export function getResumeFilename(lang: string | undefined): string {
  return lang && lang.toLowerCase().startsWith('zh') ? 'Aloute-Sana-Resume-zh.pdf' : 'Aloute-Sana-Resume-en.pdf';
}
