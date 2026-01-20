const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                padding: '2rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
            }}
            className="footer-container"
        >
            <span
                className="font-mono"
                style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                }}
            >
                © {currentYear} Gabriel Portfolio
            </span>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                }}
            >
                <span
                    className="font-mono"
                    style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                    }}
                >
                    Design by Claude
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span
                    className="font-mono"
                    style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                    }}
                >
                    Built with React
                </span>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .footer-container {
                        flex-direction: row !important;
                        justify-content: space-between !important;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
