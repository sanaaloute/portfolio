import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Experience', path: '/experience' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-bold text-text">
          Aloute<span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm font-medium transition ${
                  location.pathname === link.path ? 'text-text' : 'text-text-muted hover:text-text'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80">
                <Shield size={16} />
                Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn-secondary py-2 text-xs">
              Log out
            </button>
          ) : (
            <Link to="/login" className="btn-secondary py-2 text-xs">
              Log in
            </Link>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-text md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
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
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={`block py-2 text-sm font-medium ${
                      location.pathname === link.path ? 'text-text' : 'text-text-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <li>
                  <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-accent">
                    <Shield size={16} /> Admin
                  </Link>
                </li>
              )}
              <li className="pt-2">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="btn-secondary w-full py-2 text-xs">
                    Log out
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary block w-full py-2 text-center text-xs">
                    Log in
                  </Link>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
