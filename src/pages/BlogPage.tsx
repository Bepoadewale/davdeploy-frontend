import { Link } from 'react-router-dom';
import type { BlogPost } from '../api/contracts';
import BrandMark from '../components/BrandMark';
import PublicFooter from '../components/PublicFooter';
import { useAuth } from '../auth/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { usePublicMetadata } from '../hooks/usePublicMetadata';

function formatDate(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
    : null;
}

export default function BlogPage() {
  const { api } = useAuth();
  const posts = useAsync(
    (signal) => api.request<BlogPost[]>('/api/v1/blog/posts', { authenticated: false, signal }),
    [api],
  );
  usePublicMetadata({
    title: 'Blog | DavDeploy',
    description: 'Practical notes on clearer, cost-aware cloud infrastructure decisions.',
    path: '/blog',
  });

  return (
    <main className="ac3-page ac3-editorial-page">
      <header className="ac3-header">
        <Link className="ac3-brand" to="/" aria-label="DavDeploy home">
          <BrandMark />
          <span>DavDeploy</span>
        </Link>
        <Link className="ac3-header-action" to="/">
          Home
        </Link>
      </header>
      <section className="ac3-editorial ac3-blog" aria-labelledby="blog-heading">
        <p className="ac3-eyebrow">DavDeploy journal</p>
        <h1 id="blog-heading">Notes for clearer cloud decisions.</h1>
        <p className="ac3-intro">Practical ideas from the DavDeploy team about building simply.</p>
        {posts.loading ? <p role="status">Loading posts…</p> : null}
        {posts.error ? (
          <div className="notice notice-error" role="alert">
            <p>Posts could not be loaded right now.</p>
            <button className="button button-secondary" type="button" onClick={posts.reload}>
              Try again
            </button>
          </div>
        ) : null}
        {!posts.loading && !posts.error && posts.data?.length === 0 ? (
          <p className="ac3-blog-empty">The first DavDeploy note is on its way.</p>
        ) : null}
        <div className="ac3-blog-list">
          {posts.data?.map((post) => (
            <article key={post.id} className="ac3-blog-card">
              <p>{formatDate(post.published_at ?? post.created_at)}</p>
              <h2>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.summary}</p>
              <Link className="ac3-text-link" to={`/blog/${post.slug}`}>
                Read article
              </Link>
            </article>
          ))}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
