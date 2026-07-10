import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingState } from './components/LoadingState';

import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { ExperiencePage } from './pages/Experience';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

// Admin pages are lazy-loaded so their heavy deps (react-quill, framer-motion usage)
// don't bloat the public bundle.
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })));
const ProfileEditor = lazy(() => import('./pages/admin/ProfileEditor').then((m) => ({ default: m.ProfileEditor })));
const ProjectsManager = lazy(() => import('./pages/admin/ProjectsManager').then((m) => ({ default: m.ProjectsManager })));
const ExperienceManager = lazy(() => import('./pages/admin/ExperienceManager').then((m) => ({ default: m.ExperienceManager })));
const SkillsManager = lazy(() => import('./pages/admin/SkillsManager').then((m) => ({ default: m.SkillsManager })));
const BlogManager = lazy(() => import('./pages/admin/BlogManager').then((m) => ({ default: m.BlogManager })));
const UploadsManager = lazy(() => import('./pages/admin/UploadsManager').then((m) => ({ default: m.UploadsManager })));

const withSuspense = (el: ReactNode) => <Suspense fallback={<LoadingState />}>{el}</Suspense>;

function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={withSuspense(<AdminLayout />)}>
                <Route index element={withSuspense(<Dashboard />)} />
                <Route path="profile" element={withSuspense(<ProfileEditor />)} />
                <Route path="projects" element={withSuspense(<ProjectsManager />)} />
                <Route path="experience" element={withSuspense(<ExperienceManager />)} />
                <Route path="skills" element={withSuspense(<SkillsManager />)} />
                <Route path="blog" element={withSuspense(<BlogManager />)} />
                <Route path="uploads" element={withSuspense(<UploadsManager />)} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}

export default App;
