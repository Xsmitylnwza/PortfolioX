import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { CaseHeroMedia } from './ProjectDetailsPrimitives';
import { CaseActions } from './ProjectDetailsShared';
import {
  KeshiStatePair,
  KeshiAtmosphere,
  KeshiRhythmDiagram,
  KeshiDisciplineProof,
  KeshiArchitecture,
} from './ProjectDetailsKeshi';
import type { CaseLayoutProps } from '../features/project-details/types';

/* ---------------------------------------------------------------------------
 * Keshi — "next" preview (?layout=next). The page is a Pomodoro session:
 * dense Focus beats alternate with spacious Relax beats (DESIGN.md A21), and
 * a session clock counts each beat down as the reader scrolls — the project's
 * own gimmick (A22). Every sentence below is lifted from verified sources:
 * projects.js, PROJECT_DECISIONS or the current Keshi copy. Nothing invented.
 * ------------------------------------------------------------------------ */

const KESHI_NEXT_CHOICES = [
  {
    chose: 'A rhythm.',
    not: 'Two cosmetic themes',
    body: 'Focus and break are mental states, not theme toggles. The room changes when the work does.',
  },
  {
    chose: 'Done, or not done.',
    not: 'A 1–10 vibes score',
    body: 'Habits score binary — legacy 1–10 entries count as done above zero — so the mirror stays honest about whether you showed up.',
  },
  {
    chose: 'The person decides.',
    not: 'A coach or guilt machine',
    body: 'Hermes reads the shared evidence and returns a quiet cue. It never silently takes over the timer.',
  },
];

const KESHI_SESSION_SECONDS = { focus: 25 * 60, relax: 5 * 60 };

const formatSessionClock = (seconds: number) => {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
};

const KeshiBeatMark = ({ mode, index }: { mode: 'focus' | 'relax'; index: string | number }) => (
  <p className={`keshi-beat__mark keshi-beat__mark--${mode}`} aria-hidden="true" data-wave-follow>
    <i />
    <span>{mode === 'focus' ? 'Focus' : 'Relax'} {index}</span>
    <span>{mode === 'focus' ? '25:00' : '05:00'}</span>
  </p>
);

/**
 * Fixed session clock. Portalled to <body>: the case section is transformed
 * by the page wave, and a fixed element inside a transformed ancestor would
 * pin to that ancestor instead of the viewport. Written through refs rather
 * than state so scrolling never re-renders the page.
 */
const KeshiSessionClock = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const beats = [...document.querySelectorAll<HTMLElement>('[data-keshi-beat]')];
    const modeLabel = modeRef.current;
    const timeLabel = timeRef.current;
    const bar = barRef.current;
    if (!root || !modeLabel || !timeLabel || !bar || beats.length === 0) return undefined;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const line = window.innerHeight * 0.55;
      let active = beats[0];
      for (const beat of beats) {
        if (beat.getBoundingClientRect().top <= line) active = beat;
      }
      const rect = active.getBoundingClientRect();
      // Later beats start counting when their top crosses the line. The first
      // beat is already past the line at page top, so it counts from scroll 0
      // instead — otherwise the session would open at 18:45, not 25:00.
      const raw = active === beats[0]
        ? window.scrollY / Math.max(1, rect.top + window.scrollY + rect.height - line)
        : (line - rect.top) / Math.max(1, rect.height);
      const progress = Math.min(1, Math.max(0, raw));
      const mode = active.dataset.keshiBeat;

      root.dataset.mode = mode;
      if (mode === 'end') {
        modeLabel.textContent = 'Session complete';
        timeLabel.textContent = '00:00';
        bar.style.transform = 'scaleX(1)';
      } else {
        modeLabel.textContent = `${mode === 'focus' ? 'Focus' : 'Relax'} ${active.dataset.keshiBeatIndex}`;
        timeLabel.textContent = formatSessionClock((mode === 'focus' ? KESHI_SESSION_SECONDS.focus : KESHI_SESSION_SECONDS.relax) * (1 - progress));
        bar.style.transform = `scaleX(${progress.toFixed(3)})`;
      }
      root.dataset.ready = 'true';
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    queue();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return createPortal(
    <div ref={rootRef} className="keshi-session" data-mode="focus" aria-hidden="true">
      <span className="keshi-session__dot" />
      <span ref={modeRef} className="keshi-session__mode">Focus 01</span>
      <span ref={timeRef} className="keshi-session__time">25:00</span>
      <span className="keshi-session__bar"><i ref={barRef} /></span>
    </div>,
    document.body,
  );
};

const KeshiLayoutNext = ({ project, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => {
  const [firstWord, ...restWords] = project.title.split(' ');

  return (
    <>
      {/* FOCUS 01 — the object, at full volume */}
      <header
        className="keshi-beat keshi-beat--focus keshi-next-hero case-reveal"
        data-reveal="mount"
        data-keshi-beat="focus"
        data-keshi-beat-index="01"
        style={{ '--reveal-index': 1 }}
      >
        <div className="keshi-next-hero__meta" data-wave-follow>
          <span>{project.category || 'Selected system'}</span>
          <span>Role — {project.role || 'Software Engineer'}</span>
        </div>
        <h1 id="case-title" className="keshi-next-hero__title" data-wave-follow>
          <span>{firstWord}</span>
          <span>{restWords.join(' ')}</span>
        </h1>
        <div className="keshi-next-hero__brief" data-wave-follow>
          <p className="keshi-next-hero__thesis">Focus that leaves evidence.</p>
          <div className="keshi-next-hero__lede">
            <p>
              A lo-fi Focus / Relax timer that grows into a quiet Discipline pattern mirror —
              not a coach or guilt machine.
            </p>
            <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
          </div>
        </div>
        <div className="keshi-next-hero__stage">
          <CaseHeroMedia project={project} sizes="(max-width: 900px) 100vw, 1200px" />
        </div>
      </header>

      {/* RELAX 01 — one breath: why it exists */}
      <section
        className="keshi-beat keshi-beat--relax keshi-next-breath case-reveal"
        data-reveal="scroll"
        data-keshi-beat="relax"
        data-keshi-beat-index="01"
        style={{ '--reveal-index': 0 }}
        aria-labelledby="keshi-next-breath-title"
      >
        <KeshiBeatMark mode="relax" index="01" />
        <h2 id="keshi-next-breath-title" data-wave-follow>
          Rhythm over empty productivity theater.
        </h2>
        <p data-wave-follow>
          Keshi sits between sterile stopwatches and aesthetic shells that forget tracking.
        </p>
      </section>

      {/* FOCUS 02 — the product, dense */}
      <div className="keshi-beat keshi-beat--focus" data-keshi-beat="focus" data-keshi-beat-index="02">
        <KeshiBeatMark mode="focus" index="02" />
        <KeshiStatePair />
        <KeshiAtmosphere project={project} gallery={gallery} />
      </div>

      {/* RELAX 02 — the decisions, stated as refusals */}
      <section
        className="keshi-beat keshi-beat--relax keshi-next-choices case-reveal"
        data-reveal="scroll"
        data-keshi-beat="relax"
        data-keshi-beat-index="02"
        style={{ '--reveal-index': 0 }}
        aria-labelledby="keshi-next-choices-title"
      >
        <KeshiBeatMark mode="relax" index="02" />
        <h2 id="keshi-next-choices-title" className="keshi-next-choices__title" data-wave-follow>
          Three things it refuses to be.
        </h2>
        <ol className="keshi-next-choices__list">
          {KESHI_NEXT_CHOICES.map((choice) => (
            <li key={choice.chose} data-wave-follow>
              <p className="keshi-next-choices__not">
                <span>Not</span> <s>{choice.not}</s>
              </p>
              <h3>{choice.chose}</h3>
              <p className="keshi-next-choices__body">{choice.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FOCUS 03 — the system and its evidence: the climb */}
      <div className="keshi-beat keshi-beat--focus" data-keshi-beat="focus" data-keshi-beat-index="03">
        <KeshiBeatMark mode="focus" index="03" />
        <KeshiRhythmDiagram />
        <KeshiDisciplineProof project={project} gallery={gallery} />
        <KeshiArchitecture techItems={techItems} />
      </div>

      {/* RELAX 03 — the wall label, as in a gallery */}
      <section
        className="keshi-beat keshi-beat--relax keshi-next-placard case-reveal"
        data-reveal="scroll"
        data-keshi-beat="relax"
        data-keshi-beat-index="03"
        style={{ '--reveal-index': 0 }}
        aria-labelledby="keshi-next-placard-title"
      >
        <KeshiBeatMark mode="relax" index="03" />
        <div className="keshi-next-placard__card" data-wave-follow>
          <h2 id="keshi-next-placard-title">
            {project.title}
            <span>{project.year}</span>
          </h2>
          <dl>
            <div>
              <dt>Role</dt>
              <dd>{project.role || 'Software Engineer'}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>{techItems.join(' · ')}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="keshi-next-end" data-keshi-beat="end" aria-label="End of case study">
        <p className="keshi-next-end__line" data-wave-follow>Session complete.</p>
        <Link to="/" className="keshi-next-end__link" data-cursor="default">
          Back to the gallery
        </Link>
      </section>

      <KeshiSessionClock />
    </>
  );
};


export default KeshiLayoutNext;
