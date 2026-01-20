const Signature = () => (
    <svg width="150" height="60" viewBox="0 0 200 100" style={{ opacity: 0.8 }} className="signature-svg">
        <path
            d="M 20 60 Q 50 10 70 50 T 120 40 T 170 60"
            fill="none"
            stroke="var(--red-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="200"
            strokeDashoffset="0"
        >
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="3s" repeatCount="indefinite" />
        </path>
        <text x="50" y="80" fontFamily="'Instrument Serif', serif" fontStyle="italic" fontSize="20" fill="var(--text-muted)">
            made with love & chaos
        </text>
    </svg>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                padding: '4rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(to top, #000, transparent)'
            }}
            className="footer-container"
        >
            <div className="signature-wrapper" style={{ marginBottom: '1rem' }}>
                <Signature />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
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
                        justifyContent: 'center'
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
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .footer-container {
                        /* Keep centered for signature focus, or row if preferred. */
                        /* Let's keep it centered column for the signature impact */
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
