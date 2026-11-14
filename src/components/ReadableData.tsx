import type { ReactNode } from 'react';

function humanize(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '')
    return <span className="muted">Not provided</span>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return <span className="muted">None recorded</span>;
    return (
      <ul>
        {value.map((item, index) => (
          <li key={index}>{renderValue(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    return (
      <dl className="data-list">
        {Object.entries(value).map(([key, item]) => (
          <div key={key}>
            <dt>{humanize(key)}</dt>
            <dd>{renderValue(item)}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return String(value);
}

export function ReadableData({ value }: { value: unknown }) {
  return <div className="readable-data">{renderValue(value)}</div>;
}
