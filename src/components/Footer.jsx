import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="portfolio-footer">
            <div className="portfolio-footer-main">
                <div className="portfolio-footer-brand">
                    <span className="portfolio-footer-monogram" aria-hidden="true">CS</span>
                    <span>
                        <strong>Chaimongkon Sokgampang</strong>
                        <small>Software Engineer</small>
                    </span>
                </div>

                <p>
                    (c) {currentYear} Chaimongkon Sokgampang.
                    <br />
                    Portfolio built with React.
                </p>

                <nav aria-label="Footer links">
                    <a href="mailto:chaimongkon.sokgampang@gmail.com">Email</a>
                    <a href="https://github.com/Xsmitylnwza" target="_blank" rel="noreferrer">GitHub {'->'}</a>
                    <a
                        href="/assets/Chaimongkon-Sokgampang_Resume.pdf"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Resume {'->'}
                    </a>
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
