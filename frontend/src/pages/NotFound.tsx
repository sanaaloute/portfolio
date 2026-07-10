import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '../components/PageWrapper';

export function NotFound() {
  const { t } = useTranslation();
  return (
    <PageWrapper>
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        <h1 className="font-display text-7xl font-bold text-accent">404</h1>
        <h2 className="mt-4 font-display text-2xl font-semibold text-text">{t('notFound.title')}</h2>
        <p className="mt-2 text-text-muted">{t('notFound.subtitle')}</p>
        <Link to="/" className="btn-primary mt-6">
          {t('notFound.goHome')}
        </Link>
      </div>
    </PageWrapper>
  );
}
