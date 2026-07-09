import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Briefcase,
  Wrench,
  Newspaper,
  Image,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

const tabs = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/profile', label: 'Profile', icon: User },
  { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { path: '/admin/experience', label: 'Experience', icon: Briefcase },
  { path: '/admin/skills', label: 'Skills', icon: Wrench },
  { path: '/admin/blog', label: 'Blog', icon: Newspaper },
  { path: '/admin/uploads', label: 'Uploads', icon: Image },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg pt-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
        <aside className="lg:w-64 lg:flex-shrink-0">
          <div className="surface sticky top-24 overflow-hidden">
            <div className="border-b border-border p-4">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-text-muted hover:text-text">
                <ChevronLeft size={16} /> Back to site
              </button>
            </div>
            <nav className="p-2">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  end={tab.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-surface-2 hover:text-text'
                    }`
                  }
                >
                  <tab.icon size={18} />
                  {tab.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <LogOut size={18} /> Log out
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
