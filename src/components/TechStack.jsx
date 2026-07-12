import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentRoomReveal } from '../hooks/useDocumentRoomReveal';
import './TechStack.css';

const architectureLayers = [
    {
        number: '01',
        title: 'Interface',
        signal: 'PRODUCT -> INTERACTION',
        description: 'Translate product journeys and engineering needs into clear, maintainable web interfaces.',
        evidence: 'Booking flows / internal dashboards / interactive products',
        tools: ['React', 'Next.js', 'Vue.js', 'React Query', 'MUI'],
    },
    {
        number: '02',
        title: 'Services',
        signal: 'LOGIC -> RELIABLE APIs',
        description: 'Turn complex workflows into focused services, from configurable banking rules to third-party middleware.',
        evidence: 'AML rule engine / middleware APIs / payment workflows',
        tools: ['Java', 'Spring Boot', 'Spring Batch', 'Node.js', 'Elysia.js', 'Go', 'Fiber', 'WebSocket'],
    },
    {
        number: '03',
        title: 'Data',
        signal: 'STATE -> SOURCE OF TRUTH',
        description: 'Keep business state explicit across relational data, operational storage, and synchronized clients.',
        evidence: 'SQL-driven configuration / realtime booking state / file storage',
        tools: ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Supabase', 'AWS S3'],
    },
    {
        number: '04',
        title: 'Delivery',
        signal: 'COMMIT -> RELEASE',
        description: 'Make builds repeatable across environments with containers, CI/CD pipelines, and cloud infrastructure.',
        evidence: 'Automated builds / container delivery / production deployment',
        tools: ['Docker', 'Jenkins', 'GitLab CI', 'Kaniko', 'Nginx', 'AWS EC2'],
    },
];

const workingLoop = ['Requirements', 'Architecture', 'Build + test', 'Deploy + refine'];

const TechStack = () => {
    const sectionRef = useRef(null);

    useDocumentRoomReveal(sectionRef, {
        paths: ['/stack', '/tech'],
        mountDelayMs: 90,
    });

    return (
        <section
            id="capabilities"
            ref={sectionRef}
            className="engine-section"
            aria-labelledby="engine-title"
        >
            <div className="engine-shell">
                <div className="engine-chapter engine-reveal" data-reveal="mount" style={{ "--reveal-index": 0 }}>
                    <span>03</span>
                    <span>ENGINE</span>
                    <i aria-hidden="true" />
                    <span>CAPABILITY BLUEPRINT</span>
                </div>

                <header className="engine-header">
                    <div className="engine-title-block engine-reveal" data-reveal="mount" style={{ "--reveal-index": 1 }}>
                        <p className="engine-kicker">FULL-STACK SYSTEMS / CURRENT TOOLSET</p>
                        <h2 id="engine-title">
                            One system.
                            <br />
                            <em>Four connected layers.</em>
                        </h2>
                    </div>

                    <div className="engine-intro engine-reveal" data-reveal="mount" style={{ "--reveal-index": 2 }}>
                        <p>
                            I work through the whole path: clarify the requirement, shape the
                            architecture, build the product, then make delivery repeatable.
                        </p>
                        <span className="engine-handnote">systems, not icon clouds -&gt;</span>
                        <div className="engine-cta-row">
                            <Link to="/experience" data-cursor="view" data-cursor-text="SEE PROOF">
                                See it in Experience
                            </Link>
                            <Link to="/contact" data-cursor="view" data-cursor-text="OPEN CONTACT">
                                Contact / Resume
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="engine-blueprint engine-reveal" data-reveal="scroll" style={{ "--reveal-index": 0 }}>
                    <div className="engine-flow" aria-hidden="true">
                        <span>USER SIGNAL</span>
                        <i />
                        <span>RELIABLE RELEASE</span>
                    </div>

                    <ol className="engine-layers" aria-label="Software architecture capabilities">
                        {architectureLayers.map((layer, index) => (
                            <li
                                key={layer.number}
                                className="engine-layer"
                                data-reveal="scroll"
                                style={{ '--layer-index': index, '--reveal-index': index }}
                                data-cursor="view"
                                data-cursor-text="INSPECT"
                            >
                                <div className="engine-layer-number" aria-hidden="true">
                                    {layer.number}
                                </div>

                                <div className="engine-layer-copy">
                                    <p>{layer.signal}</p>
                                    <h3>{layer.title}</h3>
                                    <span>{layer.description}</span>
                                    <small>{layer.evidence}</small>
                                </div>

                                <ul className="engine-tools" aria-label={`${layer.title} technologies`}>
                                    {layer.tools.map((tool) => (
                                        <li key={tool}>{tool}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="engine-loop engine-reveal" data-reveal="scroll" style={{ "--reveal-index": 1 }} aria-label="Engineering working loop">
                    <p>WORKING LOOP</p>
                    <ol>
                        {workingLoop.map((step, index) => (
                            <li key={step}>
                                <span>{String(index + 1).padStart(2, '0')}</span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
};

export default TechStack;
