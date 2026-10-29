import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

export default function PublicFooter() {
  return (
    <footer className="ac3-footer" aria-label="Public site navigation">
      <Link className="ac3-brand" to="/" aria-label="DavDeploy home">
        <BrandMark />
        <span>davdeploy</span>
      </Link>
      <nav className="ac3-footer-nav" aria-label="Company">
        <Link to="/team">Team</Link>
        <Link to="/about">About Us</Link>
      </nav>
      <Link className="ac3-footer-sign-in" to="/login">
        Workspace sign in
      </Link>
    </footer>
  );
}
