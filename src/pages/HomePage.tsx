import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { ProductVisual } from '../components/ProductVisual';

const outcomes = [
  {
    tone: 'orange',
    label: 'Architecture',
    title: 'Only what you need',
    text: 'Architecture matched to workload and budget.',
    visual: 'architecture' as const,
  },
  {
    tone: 'green',
    label: 'Governance',
    title: 'Decisions with proof',
    text: 'Evidence and approvals stay attached.',
    visual: 'governance' as const,
  },
  {
    tone: 'blue',
    label: 'Cost',
    title: 'Tradeoffs in view',
    text: 'See spend, risk, and complexity early.',
    visual: 'cost' as const,
  },
];

const workflow = [
  ['01', 'Connect', 'Code and cloud context.'],
  ['02', 'Plan', 'The simplest viable architecture.'],
  ['03', 'Approve', 'Evidence, cost, and exact change.'],
  ['04', 'Deploy', 'Governed execution in your cloud.'],
];

const audiences = [
  {
    title: 'Technical founders',
    text: 'Make the big infrastructure calls without becoming a full-time cloud architect.',
    visual: 'architecture' as const,
  },
  {
    title: 'Growing product teams',
    text: 'Give product, engineering, and leadership one shared view of the trade-offs.',
    visual: 'governance' as const,
  },
  {
    title: 'Teams with real stakes',
    text: 'Keep cost, security, and delivery conversations clear before the work gets expensive.',
    visual: 'cost' as const,
  },
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
        <nav aria-label="Public navigation">
          <a href="#product">Product</a>
          <a href="#workflow">How it works</a>
          <a href="#security">Governance</a>
        </nav>
        <Link className="ac3-header-action" to="/login">
          Sign in <ArrowIcon />
        </Link>
      </header>

      <section className="ac3-hero" aria-labelledby="hero-heading">
        <div className="ac3-hero-copy">
          <p className="ac3-kicker">
            <span /> Governed infrastructure for your cloud
          </p>
          <h1 id="hero-heading">Cloud decisions, built on evidence.</h1>
          <p className="ac3-hero-summary">
            Plan, approve, and deploy the right infrastructure in your cloud.
          </p>
          <div className="ac3-actions">
            <Link className="ac3-button ac3-button-primary" to="/login">
              Open workspace <ArrowIcon />
            </Link>
            <a className="ac3-button ac3-button-secondary" href="#product">
              See the product
            </a>
          </div>
          <ul className="ac3-proof-list" aria-label="Product principles">
            <li>
              <CheckIcon /> Repository-aware
            </li>
            <li>
              <CheckIcon /> Cost-conscious
            </li>
            <li>
              <CheckIcon /> Human-approved
            </li>
          </ul>
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

      <section className="ac3-trust" aria-label="davdeploy product boundaries">
        <div>
          <strong>Customer-cloud</strong>
          <span>Infrastructure stays in your account</span>
        </div>
        <div>
          <strong>Evidence-led</strong>
          <span>Reasoning stays reviewable</span>
        </div>
        <div>
          <strong>Governed</strong>
          <span>Humans approve exact plans</span>
        </div>
        <div>
          <strong>Cost-aware</strong>
          <span>Complexity must earn its place</span>
        </div>
      </section>

      <section className="ac3-audience" aria-labelledby="audience-heading">
        <div className="ac3-section-heading">
          <p className="ac3-eyebrow">Made for the people carrying the decision</p>
          <h2 id="audience-heading">Less second-guessing. More forward motion.</h2>
          <p>
            DavDeploy gives a growing team a calmer way to turn a cloud idea into a plan everyone
            can stand behind.
          </p>
        </div>
        <div className="ac3-audience-grid">
          {audiences.map((audience) => (
            <article key={audience.title}>
              <ProductVisual kind={audience.visual} compact />
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="product" className="ac3-product" aria-labelledby="product-heading">
        <div className="ac3-section-heading">
          <p className="ac3-eyebrow">One clear decision record</p>
          <h2 id="product-heading">From intent to running infrastructure.</h2>
          <p>One clear path from evidence to operation.</p>
        </div>
        <div className="ac3-outcomes">
          {outcomes.map((outcome) => (
            <article key={outcome.label} className={`ac3-outcome ac3-outcome-${outcome.tone}`}>
              <ProductVisual kind={outcome.visual} compact />
              <span>{outcome.label}</span>
              <h3>{outcome.title}</h3>
              <p>{outcome.text}</p>
            </article>
          ))}
        </div>
        <div id="security" className="ac3-evidence-panel">
          <div>
            <p className="ac3-eyebrow">Built-in restraint</p>
            <h3>Complexity must earn its place.</h3>
          </div>
          <ul>
            <li>
              <span>Selected</span>
              <strong>Managed services matched to the workload</strong>
            </li>
            <li>
              <span>Rejected</span>
              <strong>Cluster overhead without a proven need</strong>
            </li>
            <li>
              <span>Recorded</span>
              <strong>Cost, risk, policy, approval, and observed outcome</strong>
            </li>
          </ul>
        </div>
      </section>

      <section id="workflow" className="ac3-workflow" aria-labelledby="workflow-heading">
        <div className="ac3-workflow-heading">
          <p className="ac3-eyebrow">How it works</p>
          <h2 id="workflow-heading">A visible path to production.</h2>
        </div>
        <ol>
          {workflow.map(([number, title, text]) => (
            <li key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ac3-cta" aria-labelledby="cta-heading">
        <div>
          <p className="ac3-eyebrow">Start with the workload</p>
          <h2 id="cta-heading">Build and operate the right cloud infrastructure.</h2>
        </div>
        <Link className="ac3-button ac3-button-light" to="/login">
          Enter davdeploy <ArrowIcon />
        </Link>
      </section>

      <footer className="ac3-footer">
        <Link className="ac3-brand" to="/">
          <BrandMark />
          <span>davdeploy</span>
        </Link>
        <p>Plan simply. Deploy with proof.</p>
        <Link to="/login">Workspace sign in</Link>
      </footer>
    </main>
  );
}
