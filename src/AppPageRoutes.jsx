import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const ProjectDetails = lazy(() => import('./components/ProjectDetails'));
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
        element={
          <Suspense fallback={<div className="loading-fallback" />}>
            <ProjectDetails />
          </Suspense>
        }
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
    </Routes>
  );
}
