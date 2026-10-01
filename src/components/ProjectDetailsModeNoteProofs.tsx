import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { formatIndex } from './ProjectDetailsFormat';
import { MODENOTE_KIND_LABEL, MODENOTE_DEMO_NOTE, MODENOTE_CONTEXT_PROOF, MODENOTE_CAPTURE_TILES, MODENOTE_INTERFACE_PROOF } from './ProjectDetailsModeNoteData';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';

const ModeNoteSectionHead = ({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) => (
  <header className="case-modenote-head" data-wave-follow>
    <p className="case-modenote-head__eyebrow">{eyebrow}</p>
    <h2 id={id}>{title}</h2>
  </header>
);

const ModeNoteContextProof = ({ project, media }: { project: ProjectRecord; media?: ProjectMedia }) => {
  if (!media) return null;
  const label = project.galleryLabels?.[0] || 'Record, and the text follows';

  return (
    <section
      className="case-modenote-proof case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 0 }}
      aria-labelledby="modenote-proof-title"
    >
      <header className="case-modenote-proof__copy" data-wave-follow>
        <p className="case-modenote-head__eyebrow">{MODENOTE_CONTEXT_PROOF.eyebrow}</p>
        <h2 id="modenote-proof-title">{label}</h2>
        <p>{MODENOTE_CONTEXT_PROOF.summary}</p>
        <ul aria-label="Recording signals">
          {MODENOTE_CONTEXT_PROOF.chips.map((chip) => <li data-surface="dark" key={chip}>{chip}</li>)}
        </ul>
      </header>
      <CaseMediaFrame
        media={media}
        alt={`${project.title} — ${label}`}
        sizes="(max-width: 900px) 100vw, 760px"
        className="case-media__frame--modenote-proof"
        label={label}
        kindLabel={MODENOTE_KIND_LABEL}
      />
    </section>
  );
};

const ModeNoteDualCapture = () => (
  <section
    className="case-modenote-capture case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="modenote-capture-title"
  >
    <ModeNoteSectionHead eyebrow="Signature · Dual capture" title="Realtime can drop. Capture keeps going." id="modenote-capture-title" />
    <ol className="case-modenote-capture__row" aria-label="ModeNote dual capture architecture">
      {MODENOTE_CAPTURE_TILES.map((tile) => (
        <li
          className={tile.focus ? 'case-modenote-capture__tile case-modenote-capture__tile--focus' : 'case-modenote-capture__tile'}
          data-wave-follow
          data-surface={tile.focus ? 'paper' : 'base'}
          data-surface-sheen=""
          key={tile.stage}
        >
          <span className="case-modenote-capture__stage">{tile.stage}</span>
          <span className="case-modenote-capture__icon" data-surface="dark" aria-hidden="true">
            <Icon icon={tile.icon} />
          </span>
          <h3>{tile.title}</h3>
          <p>{tile.body}</p>
          <ul className="case-modenote-chips">
            {tile.items.map((item) => <li data-surface="dark" key={item}>{item}</li>)}
          </ul>
        </li>
      ))}
    </ol>
  </section>
);

const ModeNoteInterfaceProof = ({ project, gallery }: { project: ProjectRecord; gallery: ProjectMedia[] }) => {
  const items = MODENOTE_INTERFACE_PROOF.flatMap((entry) => {
    const media = gallery[entry.galleryIndex];
    if (!media) return [];
    const base = project.galleryLabels?.[entry.galleryIndex] || `Step ${entry.galleryIndex}`;
    return [{ ...entry, media, base }];
  });
  if (!items.length) return null;

  return (
    <section
      className="case-modenote-evidence case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 2 }}
      aria-labelledby="modenote-evidence-title"
    >
      <ModeNoteSectionHead eyebrow="Interface proof" title="Assist, recap, ask — one session." id="modenote-evidence-title" />
      <p className="case-modenote-evidence__note" data-wave-follow>{MODENOTE_DEMO_NOTE}</p>
      <div className="case-modenote-evidence__grid">
        {items.map((item) => (
          <article
            className="case-modenote-evidence__card"
            key={item.galleryIndex}
          >
            <CaseMediaFrame
              media={item.media}
              alt={`${project.title} — ${item.base} (fictional demo)`}
              sizes="(max-width: 900px) 100vw, 420px"
              className="case-media__frame--modenote-evidence"
              label={item.base}
              kindLabel={MODENOTE_KIND_LABEL}
            />
            <div className="case-modenote-evidence__copy" data-wave-follow>
              <span>Step {formatIndex(item.galleryIndex + 1)} · {item.step}</span>
              <h3>{item.base}</h3>
              <p>{item.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export { ModeNoteSectionHead, ModeNoteContextProof, ModeNoteDualCapture, ModeNoteInterfaceProof };
