import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { AuditEvent } from '../api/contracts';
import { AsyncRegion } from '../components/AsyncRegion';
import { EmptyState } from '../components/EmptyState';
import { RawData } from '../components/ReadableData';
import { ProductVisual } from '../components/ProductVisual';
import { useAsync } from '../hooks/useAsync';
import { downloadJson } from '../utils/downloadJson';

function metadataValue(event: AuditEvent, names: string[]) {
  const metadata = event.metadata ?? {};
  for (const name of names) {
    const value = metadata[name];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function activityProject(event: AuditEvent) {
  return metadataValue(event, ['project_name', 'project_id']) || 'Unassigned project';
}

function activityEnvironment(event: AuditEvent) {
  return metadataValue(event, ['environment', 'environment_name']) || 'No environment';
}

type ActivityGroups = Record<string, Record<string, Record<string, AuditEvent[]>>>;

export default function ActivityPage() {
  const { api } = useAuth();
  const state = useAsync(
    (signal) => api.request<AuditEvent[]>('/api/v1/audit-evidence', { signal }),
    [api],
  );
  const [query, setQuery] = useState('');
  const [project, setProject] = useState('');
  const [environment, setEnvironment] = useState('');
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const projects = useMemo(
    () => [...new Set((state.data ?? []).map(activityProject))].filter(Boolean),
    [state.data],
  );
  const environments = useMemo(
    () => [...new Set((state.data ?? []).map(activityEnvironment))].filter(Boolean),
    [state.data],
  );
  const events = useMemo(
    () =>
      (state.data ?? []).filter(
        (event) =>
          JSON.stringify(event).toLowerCase().includes(query.toLowerCase()) &&
          (!project || activityProject(event) === project) &&
          (!environment || activityEnvironment(event) === environment),
      ),
    [environment, project, query, state.data],
  );
  const grouped = events.reduce<ActivityGroups>((result, event) => {
    const projectName = activityProject(event);
    const environmentName = activityEnvironment(event);
    const day = event.at
      ? new Date(event.at).toLocaleDateString(undefined, { dateStyle: 'long' })
      : 'Date unavailable';
    const environmentGroups = (result[projectName] ??= {});
    const dayGroups = (environmentGroups[environmentName] ??= {});
    (dayGroups[day] ??= []).push(event);
    return result;
  }, {});
  return (
    <div className="page">
      <div className="page-heading visual-page-heading">
        <div>
          <p className="eyebrow">Audit activity</p>
          <h1>Every action leaves a trail.</h1>
          <p>Actors, decisions, and execution in time.</p>
        </div>
        <ProductVisual kind="activity" />
        <button className="button button-secondary" type="button" onClick={state.reload}>
          Refresh
        </button>
      </div>
      <div className="filter-bar">
        <label>
          Search activity
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Action, actor, or entity"
          />
        </label>
        <label>
          Project
          <select value={project} onChange={(event) => setProject(event.target.value)}>
            <option value="">All projects</option>
            {projects.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Environment
          <select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
            <option value="">All environments</option>
            {environments.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <button
          className="button button-secondary"
          type="button"
          disabled={!events.length}
          onClick={() =>
            downloadJson('davdeploy-audit-evidence.json', {
              exported_at: new Date().toISOString(),
              export_type: 'filtered-audit-evidence',
              filters: { query, project: project || null, environment: environment || null },
              events,
            })
          }
        >
          Download evidence
        </button>
      </div>
      <AsyncRegion
        loading={state.loading}
        error={state.error}
        onRetry={state.reload}
        label="audit activity"
      >
        {events.length ? (
          <div className="activity-groups">
            {Object.entries(grouped).map(([projectName, environments]) => (
              <section key={projectName}>
                <div className="group-heading">
                  <b>{projectName}</b>
                  <small>Project</small>
                </div>
                {Object.entries(environments).map(([environmentName, dates]) => (
                  <div className="activity-environment" key={environmentName}>
                    <p className="eyebrow">{environmentName}</p>
                    {Object.entries(dates).map(([date, items]) => (
                      <div key={date}>
                        <div className="group-heading activity-date-heading">
                          <b>{date}</b>
                          <small>{items.length} events</small>
                        </div>
                        <div className="timeline">
                          {items.map((event, index) => (
                            <button
                              type="button"
                              key={event.id ?? index}
                              onClick={() => setSelected(event)}
                            >
                              <span className="timeline-dot" />
                              <span>
                                <b>{event.action.replaceAll('_', ' ')}</b>
                                <small>
                                  {event.actor_subject ?? 'system'} · {event.entity_type ?? 'event'}{' '}
                                  ·{' '}
                                  {event.at
                                    ? new Date(event.at).toLocaleTimeString()
                                    : 'time unavailable'}
                                </small>
                              </span>
                              <span aria-hidden="true">›</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching activity"
            message="New governed actions will appear here."
          />
        )}
      </AsyncRegion>
      {selected ? (
        <div className="drawer-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Audit event</p>
                <h2 id="event-title">{selected.action.replaceAll('_', ' ')}</h2>
              </div>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <RawData value={selected} label="Event evidence" />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
