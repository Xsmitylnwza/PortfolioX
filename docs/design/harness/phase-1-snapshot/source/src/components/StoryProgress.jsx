import { useEffect, useMemo, useState } from 'react';
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
            { rootMargin: '-42% 0px -48% 0px', threshold: [0, 0.1] },
        );

        chapters.forEach(({ id }) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });
        return () => observer.disconnect();
    }, []);

    const activeIndex = useMemo(
        () => Math.max(0, chapters.findIndex((chapter) => chapter.id === activeChapter)),
        [activeChapter],
    );
    const current = chapters[activeIndex];

    return (
        <aside className="story-progress" aria-label={`Current chapter: ${current.label}`}>
            <span className="story-progress-number">{current.number}</span>
            <div className="story-progress-track" aria-hidden="true">
                {chapters.map((chapter, index) => (
                    <i key={chapter.id} className={index <= activeIndex ? 'is-complete' : ''} />
                ))}
            </div>
            <span className="story-progress-label">{current.label}</span>
        </aside>
    );
};

export default StoryProgress;
