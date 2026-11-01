import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { BlogPost } from '../api/contracts';
import { useAuth } from '../auth/AuthContext';
import { useAsync } from '../hooks/useAsync';

const blankPost = { slug: '', title: '', summary: '', body: '', state: 'DRAFT' as const };

export default function BlogManagePage() {
  const { api } = useAuth();
  const [draft, setDraft] = useState(blankPost);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const access = useAsync(
    (signal) => api.request<{ can_publish: boolean }>('/api/v1/blog/author-access', { signal }),
    [api],
  );
  const posts = useAsync(
    (signal) =>
      access.data?.can_publish
        ? api.request<BlogPost[]>('/api/v1/blog/team/posts', { signal })
        : Promise.resolve([]),
    [api, access.data?.can_publish],
  );

  if (access.loading)
    return (
      <p className="route-loading" role="status">
        Checking author access…
      </p>
    );
  if (!access.data?.can_publish) return <Navigate to="/overview" replace />;
  const value = editing ? { ...editing, state: editing.state ?? 'DRAFT' } : draft;
  const setValue = (key: keyof typeof blankPost, next: string) => {
    if (editing) setEditing({ ...editing, [key]: next });
    else setDraft({ ...draft, [key]: next } as typeof blankPost);
  };
  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    const payload = { ...value, state: value.state as 'DRAFT' | 'PUBLISHED' };
    try {
      await api.request(
        editing ? `/api/v1/blog/team/posts/${editing.id}` : '/api/v1/blog/team/posts',
        {
          method: editing ? 'PATCH' : 'POST',
          body: payload,
          retrySafe: false,
        },
      );
      setDraft(blankPost);
      setEditing(null);
      setMessage(editing ? 'Post updated.' : 'Post saved.');
      posts.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The post could not be saved.');
    }
  }
  return (
    <div className="page blog-manage">
      <div className="page-heading">
        <div>
          <p className="eyebrow">DavDeploy journal</p>
          <h1>Publish a note</h1>
          <p>Posts stay draft until you choose Published.</p>
        </div>
      </div>
      <form className="panel form-grid" onSubmit={(event) => void save(event)}>
        <label>
          Title
          <input
            value={value.title}
            onChange={(event) => setValue('title', event.target.value)}
            required
            maxLength={180}
          />
        </label>
        <label>
          URL slug
          <input
            value={value.slug}
            onChange={(event) => setValue('slug', event.target.value)}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={120}
          />
        </label>
        <label>
          Summary
          <textarea
            value={value.summary}
            onChange={(event) => setValue('summary', event.target.value)}
            required
            maxLength={360}
          />
        </label>
        <label>
          Article
          <textarea
            value={value.body}
            onChange={(event) => setValue('body', event.target.value)}
            required
            maxLength={40000}
            rows={14}
          />
        </label>
        <label>
          Visibility
          <select value={value.state} onChange={(event) => setValue('state', event.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
        <div>
          <button className="button button-primary" type="submit">
            {editing ? 'Update post' : 'Save post'}
          </button>
          {editing ? (
            <button className="button button-quiet" type="button" onClick={() => setEditing(null)}>
              Cancel edit
            </button>
          ) : null}
        </div>
        {message ? <p role="status">{message}</p> : null}
      </form>
      <section className="panel">
        <h2>Your posts</h2>
        {posts.loading ? <p>Loading posts…</p> : null}
        {posts.data?.map((post) => (
          <article className="blog-manage-item" key={post.id}>
            <div>
              <strong>{post.title}</strong>
              <p>{post.state === 'PUBLISHED' ? 'Published' : 'Draft'}</p>
            </div>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setEditing(post)}
            >
              Edit
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
