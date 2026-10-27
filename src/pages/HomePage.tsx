import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';

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
  return (
    <main className="ac3-page">
      <header className="ac3-header">
        <Link className="ac3-brand" to="/" aria-label="davdeploy home">
          <BrandMark />
          <span>davdeploy</span>
        </Link>
        <Link className="ac3-header-action" to="/login">
          Sign in <ArrowIcon />
        </Link>
      </header>

      <section className="ac3-hero" aria-labelledby="hero-heading">
        <div className="ac3-hero-copy">
          <p className="ac3-kicker">
            <span /> Governed infrastructure for your cloud
          </p>
          <h1 id="hero-heading">Write what you need. We build the path.</h1>
          <p className="ac3-hero-summary">
            Describe your product in natural language. DavDeploy turns it into a cloud plan you can
            review and deploy.
          </p>
          <div className="ac3-actions">
            <Link className="ac3-button ac3-button-primary" to="/login">
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
            <img
              src="/images/architecture-convergence.webp"
              width="1944"
              height="817"
              alt=""
              fetchPriority="high"
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
          <strong>Human-approved</strong>
        </div>
      </section>

      <section className="ac3-who" aria-labelledby="audience-heading">
        <p className="ac3-eyebrow">Who it is for</p>
        <h2 id="audience-heading">Founders and product teams making cloud decisions.</h2>
        <p>
          Start in the browser, automate from the command line, or bring DavDeploy into your AI
          tools with MCP.
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

      <footer className="ac3-footer">
        <Link className="ac3-brand" to="/">
          <BrandMark />
          <span>davdeploy</span>
        </Link>
        <Link to="/login">Workspace sign in</Link>
      </footer>
    </main>
  );
}
