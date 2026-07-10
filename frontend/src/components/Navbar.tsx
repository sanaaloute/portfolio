import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { profileApi, blogsApi } from '../lib/api';
import { LanguageSwitcher, LanguageSwitcherInline } from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.projects', path: '/projects' },
  { key: 'nav.experience', path: '/experience' },
  { key: 'nav.contact', path: '/contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useApi(profileApi.get);
  const { data: blogs } = useApi(blogsApi.list);
  const { t } = useTranslation();

  const links = blogs?.length
    ? [...navLinks.slice(0, 3), { key: 'nav.blog', path: '/blog' }, ...navLinks.slice(3)]
    : navLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <nav className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        <Link to="/" className="justify-self-start font-display text-xl font-bold text-text">
          Mr SANA
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm font-medium transition ${
                  location.pathname === link.path ? 'text-text' : 'text-text-muted hover:text-text'
                }`}
              >
                {t(link.key)}
              </Link>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80">
                <Shield size={16} />
                {t('nav.admin')}
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center justify-end gap-3 justify-self-end">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          {profile?.resume_url && (
            <a href={profile.resume_url} className="btn-secondary hidden py-2 text-xs md:inline-flex" download>
              <Download size={14} /> {t('nav.downloadCv')}
            </a>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="btn-secondary hidden py-2 text-xs md:inline-flex">
              {t('nav.logout')}
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-text md:hidden"
            aria-label={t('nav.toggleMenu')}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-bg md:hidden"
          >
            <ul className="flex flex-col gap-2 px-6 py-4">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={`block py-2 text-sm font-medium ${
                      location.pathname === link.path ? 'text-text' : 'text-text-muted'
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <li>
                  <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-accent">
                    <Shield size={16} /> {t('nav.admin')}
                  </Link>
                </li>
              )}
              {profile?.resume_url && (
                <li className="pt-2">
                  <a href={profile.resume_url} onClick={() => setOpen(false)} className="btn-secondary block w-full py-2 text-center text-xs" download>
                    <Download size={14} /> {t('nav.downloadCv')}
                  </a>
                </li>
              )}
              {isAuthenticated && (
                <li className="pt-2">
                  <button onClick={handleLogout} className="btn-secondary w-full py-2 text-xs">
                    {t('nav.logout')}
                  </button>
                </li>
              )}
              <li className="pt-2">
                <LanguageSwitcherInline />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
