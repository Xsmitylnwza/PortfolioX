// The common route shell CSS must precede the lazy case styles in both Vite
// development and production; otherwise equal-specificity case variables flip.
import './components/DocumentRoom.css';
import './components/ProjectDetails.css';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProjectRoute from './features/project-details/ProjectRoute';
import { MissingProject } from './features/project-details/projectRenderers';

const PersonaReloadView = lazy(() => import('./components/PersonaReloadView'));
const StackPage = lazy(() => import('./components/StackPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));

export default function AppPageRoutes() {
  return (
    <Routes>
      <Route path="/" element={null} />
      <Route path="/experience" element={null} />
      <Route
        path="/persona"
        element={
          <Suspense fallback={<div className="loading-fallback loading-fallback--persona" />}>
            <PersonaReloadView />
          </Suspense>
        }
      />
      <Route
        path="/project/:id"
        element={<ProjectRoute />}
      />
      <Route
        path="/stack"
        element={
          <Suspense fallback={<div className="loading-fallback" />}>
            <StackPage />
          </Suspense>
        }
      />
      <Route path="/tech" element={<Navigate to="/stack" replace />} />
      <Route
        path="/contact"
        element={
          <Suspense fallback={<div className="loading-fallback" />}>
            <ContactPage />
          </Suspense>
        }
      />
      <Route path="/resume" element={<Navigate to="/contact" replace />} />
      <Route path="/cv" element={<Navigate to="/contact" replace />} />
      <Route path="*" element={
        <Suspense fallback={<div className="loading-fallback" role="status">Loading page…</div>}>
          <MissingProject kind="page" />
        </Suspense>
      } />
    </Routes>
  );
}
