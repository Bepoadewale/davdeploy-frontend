import { Link } from 'react-router-dom';
import { ProductVisual } from '../components/ProductVisual';

export default function HelpPage() {
  return (
    <div className="page">
      <div className="page-heading visual-page-heading">
        <div>
          <p className="eyebrow">Help & updates</p>
          <h1>Plan and review AWS infrastructure.</h1>
          <p>DavDeploy records decisions; approval does not start deployment.</p>
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
          <h2>After approval</h2>
          <p>
            Approval records an administrator&apos;s decision. The current workspace cannot yet
            create a costed saved plan, apply infrastructure, or tear it down.
          </p>
          <Link to="/history">Find an approved plan</Link>
        </article>
      </div>
      <section className="panel changelog">
        <p className="eyebrow">Current release</p>
        <h2>What is available today</h2>
        <ul>
          <li>Create an AWS infrastructure plan using repository and account context.</li>
          <li>Review plan evidence and record an administrator&apos;s approval decision.</li>
          <li>Connect AWS with read-only access; the browser never receives cloud credentials.</li>
          <li>AWS is currently the only cloud provider that can be connected.</li>
          <li>
            Approval is not deployment. Applying and tearing down infrastructure are not available
            yet.
          </li>
          <li>Contact support if a workspace invitation, connection, or plan needs help.</li>
        </ul>
        <a className="button button-secondary" href="mailto:support@davdeploy.tech">
          Contact support
        </a>
        <Link className="button button-quiet" to="/settings">
          Record a support request
        </Link>
      </section>
    </div>
  );
}
