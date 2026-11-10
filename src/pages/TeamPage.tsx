import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import PublicFooter from '../components/PublicFooter';
import { usePublicMetadata } from '../hooks/usePublicMetadata';

export default function TeamPage() {
  usePublicMetadata({
    title: 'Team | DavDeploy',
    description: 'Learn about the principles behind DavDeploy.',
    path: '/team',
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

      <article className="ac3-editorial" aria-labelledby="team-heading">
        <p className="ac3-eyebrow">The team</p>
        <h1 id="team-heading">Built around clear infrastructure decisions.</h1>
        <p>
          DavDeploy helps teams understand the infrastructure choices behind an application, review
          the trade-offs, and keep decisions tied to evidence.
        </p>
        <section className="ac3-team-feature" aria-labelledby="engineering-heading">
          <div>
            <h2 id="engineering-heading">Built from practical cloud engineering.</h2>
            <p>
              DavDeploy grows from a simple principle: infrastructure should fit the product, its
              operating constraints, and the people responsible for it.
            </p>
          </div>
          <img
            src="/media/davdeploy/team-engineering-origin.webp"
            width="1376"
            height="768"
            loading="lazy"
            decoding="async"
            alt="Illustration of practical cloud engineering and infrastructure decisions"
          />
        </section>
      </article>
      <PublicFooter />
    </main>
  );
}
