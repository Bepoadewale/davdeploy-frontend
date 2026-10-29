import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import PublicFooter from '../components/PublicFooter';
import { usePublicMetadata } from '../hooks/usePublicMetadata';

const principles = [
  'Simplicity before complexity.',
  'Cost awareness by default.',
  'Security and governance built into decisions.',
  'AI-assisted recommendations with human oversight.',
  'Transparent trade-offs and auditable infrastructure changes.',
  'Customer control over cloud resources.',
  'Reliability and maintainability.',
];

export default function AboutPage() {
  usePublicMetadata({
    title: 'About Us | DavDeploy',
    description: 'DavDeploy helps teams make clear, governed cloud infrastructure decisions.',
    path: '/about',
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

      <article className="ac3-editorial ac3-about" aria-labelledby="about-heading">
        <p className="ac3-eyebrow">About DavDeploy</p>
        <h1 id="about-heading">Clearer infrastructure choices.</h1>
        <p className="ac3-intro">
          DavDeploy is an AI-powered cloud infrastructure platform for developers, founders,
          startups, and engineering teams. It helps translate natural-language requirements into
          infrastructure recommendations shaped by workload needs, budget, security, and operational
          considerations.
        </p>

        <section aria-labelledby="why-heading">
          <h2 id="why-heading">Why DavDeploy exists</h2>
          <p>
            Cloud infrastructure can become expensive and unnecessarily complicated before a product
            reaches its users. Teams are often asked to learn unfamiliar services, write
            configuration, estimate cost, secure a deployment, and maintain it—all while trying to
            build their product.
          </p>
          <p>
            DavDeploy combines AI-assisted planning with cloud engineering principles, cost
            awareness, and controlled workflows. It aims to recommend the simplest, cheapest viable
            architecture rather than defaulting to sophisticated infrastructure a workload does not
            require.
          </p>
        </section>

        <section aria-labelledby="workflow-heading">
          <h2 id="workflow-heading">How the platform is designed to work</h2>
          <ol className="ac3-about-steps">
            <li>
              <strong>Understand.</strong> Describe an application, workload, or infrastructure
              requirement in plain language.
            </li>
            <li>
              <strong>Plan.</strong> Compare suitable approaches, estimated costs, constraints, and
              trade-offs.
            </li>
            <li>
              <strong>Review.</strong> Inspect recommendations and approve the relevant bounded
              action.
            </li>
            <li>
              <strong>Deploy.</strong> Authorized execution workflows are being developed for
              supported resources when implementation and validation requirements are satisfied.
            </li>
            <li>
              <strong>Operate.</strong> Monitoring, maintenance, and bounded remediation are part of
              the longer-term operating vision.
            </li>
          </ol>
          <p className="ac3-note">
            Today, AWS planning, review, and account discovery are the implemented cloud path.
            Customer workload deployment is a controlled pilot capability, not general availability.
          </p>
        </section>

        <section aria-labelledby="clouds-heading">
          <p className="ac3-eyebrow">Starting with AWS</p>
          <h2 id="clouds-heading">Designed for a multicloud future.</h2>
          <p>
            AWS is DavDeploy&apos;s initial implemented cloud provider. The product is being
            designed to support the infrastructure choices that best fit a customer&apos;s
            application, region, budget, and operating needs—not unnecessary provider lock-in.
          </p>
          <p>
            Future integrations may include Microsoft Azure, Google Cloud Platform, Oracle Cloud
            Infrastructure, DigitalOcean, and other providers as they are developed and validated.
            They are not available today.
          </p>
        </section>

        <section aria-labelledby="approach-heading">
          <h2 id="approach-heading">Our approach</h2>
          <ul className="ac3-principles">
            {principles.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
          <p className="ac3-statement">
            AI proposes. Humans approve. Infrastructure changes remain controlled and auditable.
          </p>
          <p>
            AI is there to support engineering judgment, not bypass security boundaries or operate
            unrestricted infrastructure.
          </p>
        </section>

        <section aria-labelledby="vision-heading">
          <h2 id="vision-heading">Our vision</h2>
          <p>
            DavDeploy aims to make cloud infrastructure more accessible to developers, founders, and
            businesses of every engineering-team size. The ambition is a reliable, intelligent,
            multicloud infrastructure assistant that helps people move from an idea to a deployed
            and maintainable product with less unnecessary cost and complexity.
          </p>
        </section>

        <div className="ac3-about-closing">
          <p>Founded in October 2026 · Independently built</p>
          <a href="mailto:bepoadewale@davdeploy.tech">bepoadewale@davdeploy.tech</a>
          <Link to="/team">Meet the founder</Link>
        </div>
      </article>
      <PublicFooter />
    </main>
  );
}
