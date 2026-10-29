import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AppShell } from './layout/AppShell';

const HomePage = lazy(() => import('./pages/HomePage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const NewPlanPage = lazy(() => import('./pages/NewPlanPage'));
const PlanPage = lazy(() => import('./pages/PlanPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ProtectedRoutes() {
  const { profile } = useAuth();
  const location = useLocation();
  if (!profile) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <AppShell />;
}

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="spinner" />
      Loading workspace…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/plans/new" element={<NewPlanPage />} />
          <Route path="/plans/:revisionId" element={<PlanPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
