import { type ReactNode, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import BrandMark from '../components/BrandMark';
import { publicConfigurationIssues } from '../config';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {children}
    </svg>
  );
}

const primary = [
  {
    to: '/overview',
    label: 'Overview',
    icon: (
      <Icon>
        <path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z" />
      </Icon>
    ),
  },
  {
    to: '/plans/new',
    label: 'New plan',
    icon: (
      <Icon>
        <path d="M12 5v14M5 12h14" />
      </Icon>
    ),
  },
  {
    to: '/history',
    label: 'Plan history',
    icon: (
      <Icon>
        <path d="M4 5h16v14H4zM8 9h8M8 13h5" />
      </Icon>
    ),
  },
  {
    to: '/activity',
    label: 'Activity',
    icon: (
      <Icon>
        <path d="M4 7h10M4 12h16M4 17h12" />
      </Icon>
    ),
  },
  {
    to: '/connections',
    label: 'Connections',
    icon: (
      <Icon>
        <path d="M9 8H7a4 4 0 0 0 0 8h2m6-8h2a4 4 0 1 1 0 8h-2m-7-4h8" />
      </Icon>
    ),
  },
];

export function AppShell() {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const issues = publicConfigurationIssues();
  return (
    <div className="app-shell workspace-shell-v2">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar workspace-topbar">
        <Link className="brand" to="/overview" aria-label="davdeploy overview">
          <BrandMark />
          <span>davdeploy</span>
        </Link>
        <span className="workspace-topbar-divider" aria-hidden="true" />
        <span className="workspace-topbar-context">{profile?.workspace.name ?? 'Workspace'}</span>
        <div className="workspace-topbar-actions">
          <Link className="workspace-create-button" to="/plans/new">
            <span aria-hidden="true">+</span> New plan
          </Link>
          <span className="workspace-user" title={profile?.user.subject}>
            {profile?.user.subject.slice(0, 1).toUpperCase() ?? 'A'}
          </span>
        </div>
        <button
          className="menu-toggle button button-secondary"
          type="button"
          aria-controls="sidebar"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="menu-lines" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="sr-only">Menu</span>
        </button>
      </header>
      <aside id="sidebar" className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="workspace-card workspace-identity">
          <span className="workspace-avatar">{profile?.workspace.name.slice(0, 1) ?? 'A'}</span>
          <span>
            <b>{profile?.workspace.name ?? 'Workspace'}</b>
            <small>{profile?.user.role ?? 'member'} workspace</small>
          </span>
          <span className="workspace-chevron" aria-hidden="true">
            ⌄
          </span>
        </div>
        <nav aria-label="Workspace navigation">
          <p className="nav-label">Plan and govern</p>
          {primary.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <p className="nav-label">Workspace</p>
          <NavLink to="/settings" onClick={() => setMenuOpen(false)}>
            <span>
              <Icon>
                <circle cx="12" cy="12" r="3" />
                <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6A8 8 0 0 0 8.9 7L6.5 6l-2 3.4 2 1.5a7 7 0 0 0 0 2L4.5 14.5l2 3.4 2.4-1a8 8 0 0 0 1.5 1l.3 2.6h4L15 18a8 8 0 0 0 1.5-1l2.4 1 2-3.4-2-1.5c.1-.4.1-.7.1-1.1Z" />
              </Icon>
            </span>
            Settings
          </NavLink>
          <NavLink to="/help" onClick={() => setMenuOpen(false)}>
            <span>
              <Icon>
                <circle cx="12" cy="12" r="9" />
                <path d="M9.8 9a2.3 2.3 0 1 1 3.3 2.1c-.8.4-1.1.9-1.1 1.9M12 17h.01" />
              </Icon>
            </span>
            Help and updates
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-session">
            <span className="online-dot" aria-hidden="true" />
            <span>
              <b>{profile?.user.subject ?? 'Authenticated'}</b>
              <small>Verified by the control plane</small>
            </span>
          </div>
          <button type="button" className="button button-quiet" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </aside>
      <main id="main-content" className="main-content">
        {issues.length ? (
          <div className="configuration-banner" role="status">
            <strong>Integration setup required</strong>
            <span>{issues.join(' ')}</span>
          </div>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}
