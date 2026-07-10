import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(password);
      navigate('/admin');
    } catch {
      // error is surfaced by context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 pt-32 pb-24">
        <div className="surface p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Lock size={20} />
            </div>
          </div>
          <h1 className="text-center font-display text-2xl font-bold text-text">{t('login.title')}</h1>
          <p className="mt-2 text-center text-sm text-text-muted">{t('login.subtitle')}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.password')}
              className="input"
              required
            />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? t('login.submitting') : t('login.submit')}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
