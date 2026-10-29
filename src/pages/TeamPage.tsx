import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import PublicFooter from '../components/PublicFooter';
import { usePublicMetadata } from '../hooks/usePublicMetadata';

export default function TeamPage() {
  usePublicMetadata({
    title: 'Team | DavDeploy',
    description: 'Meet Adewale Ayeni-Bepo, founder and CEO of DavDeploy.',
    path: '/team',
  });

  return (
    <main className="ac3-page ac3-editorial-page">
      <header className="ac3-header">
        <Link className="ac3-brand" to="/" aria-label="DavDeploy home">
          <BrandMark />
          <span>davdeploy</span>
        </Link>
        <Link className="ac3-header-action" to="/">
          Home
        </Link>
      </header>

      <article className="ac3-editorial" aria-labelledby="team-heading">
        <p className="ac3-eyebrow">The team</p>
        <h1 id="team-heading">Meet the founder.</h1>
        <div className="ac3-founder-profile">
          <div
            className="ac3-founder-portrait ac3-founder-portrait-placeholder"
            role="img"
            aria-label="Portrait placeholder for Adewale Ayeni-Bepo"
          >
            <span>AA</span>
            <small>Portrait coming soon</small>
          </div>
          <div className="ac3-founder-copy">
            <h2>Adewale Ayeni-Bepo</h2>
            <p className="ac3-founder-role">Founder &amp; CEO, DavDeploy</p>
            <p>
              Adewale is a cloud and platform engineer focused on practical infrastructure that
              helps teams move with confidence. His work spans AWS architecture, Kubernetes and
              containers, Terraform and infrastructure as code, CI/CD, automation, reliability,
              monitoring, security, cloud cost optimisation, and practical AI-assisted engineering.
            </p>
            <p>
              DavDeploy grew from that work: a belief that deploying and managing cloud
              infrastructure should not require unnecessary cost, complexity, or operational
              overhead. The goal is to give builders clearer choices and controlled paths forward.
            </p>
            <div className="ac3-founder-contact">
              <a href="mailto:bepoadewale@davdeploy.tech">bepoadewale@davdeploy.tech</a>
              <a
                href="https://www.linkedin.com/in/adewale-ayeni-bepo/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </div>
            <p className="ac3-founder-meta">Founded October 2026 · Nigeria</p>
          </div>
        </div>
      </article>
      <PublicFooter />
    </main>
  );
}
