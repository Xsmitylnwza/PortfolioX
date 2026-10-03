import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Icon } from '@iconify/react';
import { VIBE_APPS, VIBE_KIND_LABEL } from './ProjectDetailsVibeData';
import type { VibeApp } from './ProjectDetailsVibeData';

const MOCK_ROWS = ['a', 'b'];

const VibeMemberRow = ({ active }: { active: VibeApp }) => (
  <div className="case-vibe-live__row case-vibe-live__row--you">
    <span className="case-vibe-live__avatar" aria-hidden="true">V<i /></span>
    <span className="case-vibe-live__who">
      <strong>Vibe Demo</strong>
      <span className="case-vibe-live__status" key={active.id}>
        <Icon icon={active.icon} aria-hidden="true" />
        Playing {active.scene}
      </span>
    </span>
  </div>
);

const VibeProfileCard = ({ active }: { active: VibeApp }) => (
  <div className="case-vibe-live__card">
    <div className="case-vibe-live__banner" aria-hidden="true" />
    <span className="case-vibe-live__avatar case-vibe-live__avatar--lg" aria-hidden="true">V<i /></span>
    <div className="case-vibe-live__card-body">
      <strong className="case-vibe-live__name">Vibe Demo</strong>
      <span className="case-vibe-live__handle">@vibe.demo</span>
      <hr />
      <span className="case-vibe-live__eyebrow">Playing</span>
      <div className="case-vibe-live__activity" key={active.id}>
        <span className="case-vibe-live__art" aria-hidden="true"><Icon icon={active.icon} /></span>
        <span>
          <strong>{active.scene}</strong>
          <span>from {active.app}</span>
        </span>
      </div>
    </div>
  </div>
);

/** Signature section: the real pairing rule — the most recently used paired app owns the status. */
const VibeLiveSwitch = () => {
  const [order, setOrder] = useState<VibeApp['id'][]>(VIBE_APPS.map((app) => app.id));
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const labelId = useId();
  const active = VIBE_APPS.find((app) => app.id === order[0]) ?? VIBE_APPS[0];

  const choose = (id: VibeApp['id']) => setOrder((prev) => (prev[0] === id ? prev : [id, ...prev.filter((item) => item !== id)]));
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + VIBE_APPS.length) % VIBE_APPS.length;
    choose(VIBE_APPS[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <section
      className="case-vibe-live case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 0 }}
      aria-labelledby="vibe-live-title"
    >
      <header className="case-vibe-head" data-wave-follow>
        <p className="case-vibe-head__eyebrow">Signature · Live switch</p>
        <h2 id="vibe-live-title">Use an app. Your status follows it.</h2>
      </header>
      <div className="case-vibe-live__grid">
        <div className="case-vibe-live__controls" data-wave-follow>
          <p id={labelId} className="case-vibe-live__prompt">Bring an app to the front</p>
          <div className="case-vibe-live__apps" role="radiogroup" aria-labelledby={labelId}>
            {VIBE_APPS.map((app, index) => (
              <button
                type="button"
                role="radio"
                aria-checked={app.id === active.id}
                tabIndex={app.id === active.id ? 0 : -1}
                className="case-vibe-live__app"
                data-surface={app.id === active.id ? 'paper' : 'dark'}
                key={app.id}
                ref={(node) => { buttons.current[index] = node; }}
                onClick={() => choose(app.id)}
                onFocus={() => choose(app.id)}
                onPointerEnter={(event) => { if (event.pointerType === 'mouse') choose(app.id); }}
                onKeyDown={(event) => onKeyDown(event, index)}
                data-cursor="default"
              >
                <Icon icon={app.icon} aria-hidden="true" />
                <span>{app.app}</span>
                <small>{app.scene}</small>
              </button>
            ))}
          </div>
          <ol className="case-vibe-live__recent" aria-label="Paired apps, most recently used first">
            {order.map((id) => {
              const app = VIBE_APPS.find((item) => item.id === id);
              return app ? <li key={id} data-surface="dark" aria-current={id === active.id ? 'true' : undefined}>{app.app}</li> : null;
            })}
          </ol>
          <p className="case-vibe-live__rule">The most recently used paired app wins. Pairs, not guesses.</p>
        </div>
        <div className="case-vibe-live__stage" data-surface="base" data-surface-sheen="" data-wave-follow>
          <span className="case-vibe-live__kind">{VIBE_KIND_LABEL}</span>
          <div className="case-vibe-live__window" aria-hidden="true">
            <div className="case-vibe-live__members">
              <span className="case-vibe-live__eyebrow">Online — 3</span>
              <VibeMemberRow active={active} />
              {MOCK_ROWS.map((key) => (
                <div className="case-vibe-live__row" key={key}>
                  <span className="case-vibe-live__avatar"><i /></span>
                  <span className="case-vibe-live__bar" />
                </div>
              ))}
            </div>
            <VibeProfileCard active={active} />
          </div>
          <p className="case-vibe-live__sr" role="status" aria-live="polite">
            Status is now Playing {active.scene}, set from {active.app}.
          </p>
        </div>
      </div>
      <p className="case-vibe-live__note" data-wave-follow>Fictional data. A simplified model of the pairing rule — not a recording.</p>
    </section>
  );
};

export default VibeLiveSwitch;
