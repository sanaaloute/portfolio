import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';

import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { ExperiencePage } from './pages/Experience';
import { BlogPage } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Contact } from './pages/Contact';
import { Chat } from './pages/Chat';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

import { Dashboard } from './pages/admin/Dashboard';
import { ProfileEditor } from './pages/admin/ProfileEditor';
import { ProjectsManager } from './pages/admin/ProjectsManager';
import { ExperienceManager } from './pages/admin/ExperienceManager';
import { SkillsManager } from './pages/admin/SkillsManager';
import { BlogManager } from './pages/admin/BlogManager';
import { UploadsManager } from './pages/admin/UploadsManager';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg text-text">
      <ScrollToTop />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<ProfileEditor />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="experience" element={<ExperienceManager />} />
              <Route path="skills" element={<SkillsManager />} />
              <Route path="blog" element={<BlogManager />} />
              <Route path="uploads" element={<UploadsManager />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default App;
