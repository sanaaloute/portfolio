import { useTranslation } from 'react-i18next';

export function LoadingState({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-text-muted">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="text-sm">{message ?? t('common.loading')}</p>
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-200">
      <p className="text-sm">{message}</p>
      {retry && (
        <button onClick={retry} className="mt-3 text-xs font-semibold underline">
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  );
}
