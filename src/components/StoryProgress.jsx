import { useEffect, useState } from 'react';
import './StoryProgress.css';

const chapters = [
    { id: 'home', number: '00', label: 'Signal' },
    { id: 'projects', number: '01', label: 'Work' },
    { id: 'experience', number: '02', label: 'Evidence' },
    { id: 'capabilities', number: '03', label: 'Engine' },
    { id: 'contact', number: '04', label: 'Channel' },
];

const StoryProgress = () => {
    const [activeChapter, setActiveChapter] = useState('home');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visible) setActiveChapter(visible.target.id);
            },
            { rootMargin: '-38% 0px -52% 0px', threshold: [0, 0.1, 0.5] }
        );

        chapters.forEach(({ id }) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <aside className="story-progress" aria-label="Portfolio story chapters">
            <span className="story-progress-title">STORY / SCROLL</span>
            <nav>
                {chapters.map((chapter) => (
                    <a
                        key={chapter.id}
                        href={`#${chapter.id}`}
                        className={activeChapter === chapter.id ? 'is-active' : ''}
                        aria-current={activeChapter === chapter.id ? 'location' : undefined}
                    >
                        <span>{chapter.number}</span>
                        <strong>{chapter.label}</strong>
                        <i aria-hidden="true" />
                    </a>
                ))}
            </nav>
        </aside>
    );
};

export default StoryProgress;
