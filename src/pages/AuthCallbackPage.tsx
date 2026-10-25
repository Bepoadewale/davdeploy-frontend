import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ProductVisual } from '../components/ProductVisual';

export default function AuthCallbackPage() {
  const { profile, error, completeCallback } = useAuth();
  const started = useRef(false);
  useEffect(() => {
    if (!profile && !started.current) {
      started.current = true;
      void completeCallback();
    }
  }, [completeCallback, profile]);
  if (profile) return <Navigate to="/overview" replace />;
  return (
    <main className="auth-page">
      <section className="auth-card" role="status">
        <ProductVisual kind="connections" compact />
        <p className="eyebrow">Identity callback</p>
        <h1>{error ? 'Sign-in could not be completed.' : 'Completing secure sign-in…'}</h1>
        <p>{error ?? 'Verifying identity and workspace access.'}</p>
        {error ? (
          <a className="button button-secondary" href="/login">
            Return to sign in
          </a>
        ) : null}
      </section>
    </main>
  );
}
