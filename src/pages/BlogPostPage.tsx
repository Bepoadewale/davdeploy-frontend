import { FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { BlogComment, BlogPost } from '../api/contracts';
import BrandMark from '../components/BrandMark';
import MarkdownArticle from '../components/MarkdownArticle';
import PublicFooter from '../components/PublicFooter';
import { useAuth } from '../auth/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { usePublicMetadata } from '../hooks/usePublicMetadata';

function formatDate(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
    : '';
}

export default function BlogPostPage() {
  const { slug = '' } = useParams();
  const { api, profile } = useAuth();
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const data = useAsync(
    async (signal) => ({
      post: await api.request<BlogPost>(`/api/v1/blog/posts/${slug}`, {
        authenticated: false,
        signal,
      }),
      comments: await api.request<BlogComment[]>(`/api/v1/blog/posts/${slug}/comments`, {
        authenticated: false,
        signal,
      }),
    }),
    [api, slug],
  );
  usePublicMetadata({
    title: data.data ? `${data.data.post.title} | DavDeploy` : 'Blog | DavDeploy',
    description: data.data?.post.summary ?? 'Practical DavDeploy infrastructure notes.',
    path: `/blog/${slug}`,
  });

  async function saveComment(event: FormEvent, commentId?: string) {
    event.preventDefault();
    if (!comment.trim()) return;
    setMessage(null);
    try {
      await api.request(
        commentId ? `/api/v1/blog/comments/${commentId}` : `/api/v1/blog/posts/${slug}/comments`,
        { method: commentId ? 'PATCH' : 'POST', body: { body: comment.trim() }, retrySafe: false },
      );
      setComment('');
      setEditing(null);
      data.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Your comment could not be saved.');
    }
  }

  if (data.loading)
    return (
      <p className="route-loading" role="status">
        Loading article…
      </p>
    );
  if (data.error || !data.data) {
    return (
      <main className="ac3-page ac3-editorial-page">
        <section className="ac3-editorial">
          <h1>Article unavailable.</h1>
          <Link to="/blog">Back to journal</Link>
        </section>
      </main>
    );
  }
  const { post, comments } = data.data;
  return (
    <main className="ac3-page ac3-editorial-page">
      <header className="ac3-header">
        <Link className="ac3-brand" to="/" aria-label="DavDeploy home">
          <BrandMark />
          <span>DavDeploy</span>
        </Link>
        <Link className="ac3-header-action" to="/blog">
          Journal
        </Link>
      </header>
      <article className="ac3-editorial ac3-blog-post" aria-labelledby="post-heading">
        <p className="ac3-eyebrow">
          DavDeploy journal · {formatDate(post.published_at ?? post.created_at)}
        </p>
        <h1 id="post-heading">{post.title}</h1>
        <p className="ac3-intro">{post.summary}</p>
        <div className="ac3-blog-body">
          <MarkdownArticle source={post.body} />
        </div>
        <section className="ac3-comments" aria-labelledby="comments-heading">
          <h2 id="comments-heading">Discussion</h2>
          {profile ? (
            <form onSubmit={(event) => void saveComment(event)}>
              <label htmlFor="blog-comment">Add a comment</label>
              <textarea
                id="blog-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={4000}
                required
              />
              <button className="button button-primary" type="submit">
                Post comment
              </button>
            </form>
          ) : (
            <p>
              <Link to="/login">Sign in</Link> to join the discussion.
            </p>
          )}
          {message ? (
            <p className="notice notice-error" role="alert">
              {message}
            </p>
          ) : null}
          {comments.map((item) => (
            <article className="ac3-comment" key={item.id}>
              <p>
                <strong>{item.author_name}</strong> ·{' '}
                {formatDate(item.updated_at ?? item.created_at)}
              </p>
              {editing === item.id ? (
                <form onSubmit={(event) => void saveComment(event, item.id)}>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    maxLength={4000}
                    required
                  />
                  <button className="button button-primary" type="submit">
                    Save comment
                  </button>
                  <button
                    className="button button-quiet"
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setComment('');
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <p>{item.body}</p>
                  {profile?.user.subject === item.author_subject ? (
                    <button
                      className="ac3-text-button"
                      type="button"
                      onClick={() => {
                        setEditing(item.id);
                        setComment(item.body);
                      }}
                    >
                      Edit comment
                    </button>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </section>
      </article>
      <PublicFooter />
    </main>
  );
}
