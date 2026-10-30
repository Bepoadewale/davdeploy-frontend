import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import PublicFooter from '../components/PublicFooter';
import WebsiteMedia from '../components/WebsiteMedia';
import { usePublicMetadata } from '../hooks/usePublicMetadata';

const workflow = [
  ['01', 'Connect'],
  ['02', 'Plan'],
  ['03', 'Review'],
  ['04', 'Deploy'],
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="m5 10 3 3 7-7" />
    </svg>
  );
}

export default function HomePage() {
  usePublicMetadata({
    title: 'DavDeploy | Cloud decisions built on evidence',
    description:
      'Plan, approve, deploy, and operate the simplest viable infrastructure in your cloud, with every decision and change tied to evidence.',
    path: '/',
  });

  return (
    <main className="ac3-page">
      <header className="ac3-header">
        <Link className="ac3-brand" to="/" aria-label="DavDeploy home">
          <BrandMark />
          <span>DavDeploy</span>
        </Link>
        <Link className="ac3-header-action" to="/overview">
          Sign in <ArrowIcon />
        </Link>
      </header>

      <section className="ac3-hero" aria-labelledby="hero-heading">
        <div className="ac3-hero-copy">
          <p className="ac3-kicker">
            <span /> Governed infrastructure for every cloud
          </p>
          <h1 id="hero-heading" className="ac3-sr-only">
            DavDeploy
          </h1>
          <p className="ac3-hero-summary">
            Describe your product in natural language. DavDeploy turns it into a cloud plan you can
            review and deploy, across any cloud.
          </p>
          <div className="ac3-actions">
            <Link className="ac3-button ac3-button-primary" to="/overview">
              Open workspace <ArrowIcon />
            </Link>
          </div>
        </div>

        <figure className="ac3-hero-product" aria-label="Illustrative davdeploy decision brief">
          <div className="ac3-product-topbar">
            <span>
              <i /> Decision brief
            </span>
            <small>Evidence linked</small>
          </div>
          <div className="ac3-product-canvas">
            <WebsiteMedia
              className="ac3-hero-media"
              src="/media/davdeploy/hero-idea-to-architecture.mp4"
              poster="/media/davdeploy/hero-idea-to-architecture-poster.jpg"
              label="architecture illustration"
              priority
            />
            <div className="ac3-plan-card">
              <p>Recommended approach</p>
              <h2>Managed compute. Private data. No cluster.</h2>
              <div className="ac3-plan-route" aria-label="Illustrative architecture">
                <span>Managed edge</span>
                <i />
                <span>Autoscaled API</span>
                <i />
                <span>Private store</span>
              </div>
            </div>
            <div className="ac3-status-card">
              <span>
                <CheckIcon />
              </span>
              <div>
                <small>Policy result</small>
                <strong>Ready for review</strong>
              </div>
            </div>
          </div>
        </figure>
      </section>

      <section className="ac3-trust" aria-label="DavDeploy principles">
        <div>
          <strong>Customer-cloud</strong>
        </div>
        <div>
          <strong>Evidence-led</strong>
        </div>
        <div>
          <strong>Multi-cloud</strong>
        </div>
        <div>
          <strong>Human-approved</strong>
        </div>
      </section>

      <section
        className="ac3-media-section ac3-media-section-simplicity"
        aria-labelledby="simplicity-heading"
      >
        <div>
          <p className="ac3-eyebrow">Minimum necessary</p>
          <h2 id="simplicity-heading">Infrastructure should fit the work.</h2>
          <p>
            Start with the simplest viable architecture, then add capability when a real workload
            needs it. DavDeploy makes the trade-offs visible before they become operating burden.
          </p>
        </div>
        <img
          src="/media/davdeploy/simplicity.webp"
          width="2752"
          height="1536"
          loading="lazy"
          decoding="async"
          alt="An overloaded cloud stack simplified into a focused architecture"
        />
      </section>

      <section className="ac3-media-section ac3-media-section-cost" aria-labelledby="cost-heading">
        <img
          src="/media/davdeploy/cost-iceberg.webp"
          width="2752"
          height="1536"
          loading="lazy"
          decoding="async"
          alt="An illustration of visible compute cost and hidden operational cost"
        />
        <div>
          <p className="ac3-eyebrow">Cost awareness</p>
          <h2 id="cost-heading">Cost is more than compute.</h2>
          <p>
            Egress, idle capacity, maintenance, and monitoring all shape the cost of a cloud
            decision. A useful plan brings those considerations into the review, not after launch.
          </p>
        </div>
      </section>

      <section className="ac3-who" aria-labelledby="audience-heading">
        <p className="ac3-eyebrow">Who it is for</p>
        <h2 id="audience-heading">Founders and product teams making cloud decisions.</h2>
        <p>
          Choose your cloud, then start in the browser, automate from the command line, or bring
          DavDeploy into your AI tools with MCP.
        </p>
      </section>

      <section id="workflow" className="ac3-workflow" aria-labelledby="workflow-heading">
        <div className="ac3-workflow-heading">
          <p className="ac3-eyebrow">How it works</p>
          <h2 id="workflow-heading">Four clear steps</h2>
        </div>
        <ol>
          {workflow.map(([number, title]) => (
            <li key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
            </li>
          ))}
        </ol>
      </section>

      <section className="ac3-governance" aria-labelledby="governance-heading">
        <WebsiteMedia
          src="/media/davdeploy/governance-human-approval.mp4"
          poster="/media/davdeploy/governance-human-approval-poster.jpg"
          label="governance illustration"
        />
        <div>
          <p className="ac3-eyebrow">Governance</p>
          <h2 id="governance-heading">AI proposes. Humans approve.</h2>
          <p>
            Plans are tied to an immutable digest, policy checks, role-based review, and an audit
            trail. Approval records a decision. It is not the same thing as deployment.
          </p>
          <Link to="/about" className="ac3-text-link">
            How DavDeploy is designed <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className="ac3-use-cases" aria-labelledby="use-cases-heading">
        <div className="ac3-section-heading">
          <p className="ac3-eyebrow">Start where you are</p>
          <h2 id="use-cases-heading">A clearer path for each stage of work.</h2>
          <p>These are planning illustrations, not tested performance or deployment claims.</p>
        </div>
        <img
          src="/media/davdeploy/use-cases.webp"
          width="2752"
          height="1536"
          loading="lazy"
          decoding="async"
          alt="Three illustrative infrastructure shapes for a small website, e-commerce API, and growing application"
        />
        <div className="ac3-use-case-grid">
          <article>
            <h3>Small website</h3>
            <p>A focused plan for a simple public product presence.</p>
          </article>
          <article>
            <h3>E-commerce API</h3>
            <p>Clearer choices around data, resilience, and security boundaries.</p>
          </article>
          <article>
            <h3>Growing application</h3>
            <p>A path that can adapt as workload and operating needs change.</p>
          </article>
        </div>
      </section>

      <section
        className="ac3-media-section ac3-media-section-ownership"
        aria-labelledby="ownership-heading"
      >
        <div>
          <p className="ac3-eyebrow">Customer control</p>
          <h2 id="ownership-heading">Your application stays in your account.</h2>
          <p>
            Permission boundaries and authorized actions are essential. DavDeploy is built to give
            customers visibility and control over the cloud resources their product relies on.
          </p>
        </div>
        <img
          src="/media/davdeploy/ownership.webp"
          width="2752"
          height="1536"
          loading="lazy"
          decoding="async"
          alt="A customer holding a protected cloud infrastructure environment"
        />
      </section>

      <section className="ac3-lifecycle" aria-labelledby="lifecycle-heading">
        <img
          src="/media/davdeploy/lifecycle.webp"
          width="2752"
          height="1536"
          loading="lazy"
          decoding="async"
          alt="An illustrated lifecycle from cloud connection to plan, review, and governed action"
        />
        <div>
          <p className="ac3-eyebrow">Evidence at every stage</p>
          <h2 id="lifecycle-heading">Connect. Plan. Review. Then act with authorization.</h2>
          <p>
            Every step builds an evidence trail. Where supported, execution is separately authorized
            and remains bounded by the reviewed plan and permission model.
          </p>
        </div>
      </section>

      <section className="ac3-brand-close" aria-label="DavDeploy brand">
        <WebsiteMedia
          src="/media/davdeploy/brand-birth-of-davdeploy.mp4"
          poster="/media/davdeploy/brand-birth-of-davdeploy-poster.jpg"
          label="DavDeploy brand illustration"
        />
        <div className="ac3-brand-close-overlay">
          <BrandMark />
          <span>DavDeploy</span>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
