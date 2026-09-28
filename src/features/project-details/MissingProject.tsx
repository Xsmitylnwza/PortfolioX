import { Link } from 'react-router-dom';
import '../../components/DocumentRoom.css';
import '../../components/ProjectDetails.css';

export default function MissingProject({ kind = 'project' }: { kind?: 'project' | 'page' }) {
  const isPage = kind === 'page';
  return (
    <div className="document-room document-room--project">
      <section className="case-section case-section--empty" aria-labelledby="case-missing-title">
        <div className="case-shell">
          <p className="case-kicker">Selected system</p>
          <h1 id="case-missing-title">{isPage ? 'Page not found' : 'Project not found'}</h1>
          <p className="case-lede">{isPage ? 'This page is not available.' : 'This system is not in the gallery.'}</p>
          <div className="case-actions">
            <Link to="/" className="case-btn case-btn--primary" data-cursor="default">
              Back to gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
