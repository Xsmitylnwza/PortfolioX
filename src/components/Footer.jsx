import './Footer.css';
import { PROFILE } from '../data/site';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="portfolio-footer">
            <div className="portfolio-footer-main">
                <div className="portfolio-footer-brand">
                    <span className="portfolio-footer-monogram" aria-hidden="true">{PROFILE.monogram}</span>
                    <span>
                        <strong>{PROFILE.name}</strong>
                        <small>{PROFILE.title}</small>
                    </span>
                </div>

                <p>
                    (c) {currentYear} {PROFILE.name}.
                    <br />
                    Portfolio built with React.
                </p>

                <nav aria-label="Footer links">
                    <a href={PROFILE.mailto}>Email</a>
                    <a href={PROFILE.github.href} target="_blank" rel="noreferrer">GitHub {'->'}</a>
                    <a href="/resume">Resume {'->'}</a>
                    <a
                        href={PROFILE.resumePdf.href}
                        target="_blank"
                        rel="noreferrer"
                    >
                        PDF {'->'}
                    </a>
                    <a href="/stack">Stack {'->'}</a>
                    <a href="/contact">Contact {'->'}</a>
                </nav>
            </div>

            <div className="portfolio-footer-signoff">
                <span>FROM CHAOS -&gt; SYSTEMS</span>
                <span>DESIGNED + OWNED BY CHAIMONGKON</span>
            </div>
        </footer>
    );
};

export default Footer;
