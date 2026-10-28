import { Link } from 'react-router-dom';
import { ProductVisual } from '../components/ProductVisual';

export default function HelpPage() {
  return (
    <div className="page">
      <div className="page-heading visual-page-heading">
        <div>
          <p className="eyebrow">Help & updates</p>
          <h1>Plan. Approve. Prepare.</h1>
          <p>Clear decisions before any cloud change.</p>
        </div>
        <ProductVisual kind="help" />
      </div>
      <div className="help-grid">
        <article className="panel">
          <span className="feature-icon">01</span>
          <h2>Planning</h2>
          <p>Connect evidence and get the minimum viable architecture.</p>
          <Link to="/plans/new">Create a plan</Link>
        </article>
        <article className="panel">
          <span className="feature-icon">02</span>
          <h2>Governance</h2>
          <p>Review an immutable plan with server-enforced policy.</p>
          <Link to="/history">Review history</Link>
        </article>
        <article className="panel">
          <span className="feature-icon">03</span>
          <h2>Execution pilot</h2>
          <p>
            Approved plans can prepare a bounded next action. Customer deployment is separately
            authorised.
          </p>
          <Link to="/activity">Inspect activity</Link>
        </article>
      </div>
      <section className="panel changelog">
        <p className="eyebrow">Current release</p>
        <h2>What is available today</h2>
        <ul>
          <li>Plan with repository and cloud-account context.</li>
          <li>Review immutable evidence and record an approval decision.</li>
          <li>Connect AWS through a customer-owned role; no browser access keys are requested.</li>
          <li>Contact support if a workspace invitation, connection, or plan needs help.</li>
        </ul>
        <a className="button button-secondary" href="mailto:support@davdeploy.tech">
          Contact support
        </a>
      </section>
    </div>
  );
}
