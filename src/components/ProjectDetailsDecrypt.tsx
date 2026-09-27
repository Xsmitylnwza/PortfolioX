import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { CaseHeroMedia, StorySectionHead } from './ProjectDetailsPrimitives';
import { CaseActions, StackBlock } from './ProjectDetailsShared';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';
import type { CaseLayoutProps } from '../features/project-details/types';

const DECRYPT_MODES = [
  {
    level: 'Hard',
    character: 'SPY',
    rules: 10,
    time: '10:00',
    tone: 'spy',
  },
  {
    level: 'Veryhard',
    character: 'FBI',
    rules: 11,
    time: '07:30',
    tone: 'fbi',
  },
  {
    level: 'Hardest',
    character: 'HACKER',
    rules: 12,
    time: '05:00',
    tone: 'hacker',
  },
];

const DECRYPT_RULE_STACK = [
  { id: '01', label: 'Three consecutive digits', state: 'passed' },
  { id: '02', label: 'At least five characters', state: 'passed' },
  { id: '03', label: 'One of ! @ # $ %', state: 'active' },
  { id: '04', label: 'Digit sum equals 35', state: 'waiting' },
];

const DecryptHero = ({ project, hasLive, hasRepo }: { project: ProjectRecord; hasLive: boolean; hasRepo: boolean }) => (
  <header
    className="case-decrypt-hero case-reveal"
    data-reveal="mount"
    style={{ '--reveal-index': 1 }}
  >
    <div className="case-decrypt-hero__copy" data-wave-follow>
      <p className="case-kicker">{project.category || 'Selected system'}</p>
      <h1 id="case-title">{project.title}</h1>
      <p className="case-decrypt-hero__thesis">One password. Every edit under pressure.</p>
      <p className="case-lede">
        A Vue browser game where the first typed character starts the clock, every edit rechecks the live rules,
        and the hardest run mutates the string you are trying to protect.
      </p>
      <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
    </div>
    <div className="case-decrypt-hero__visual">
      <CaseHeroMedia project={project} sizes="(max-width: 900px) 100vw, 760px" />
      <div className="case-decrypt-hero__caption" data-wave-follow>
        <span>Actual Hardest run</span>
        <strong>11 rules correct · crown still live</strong>
      </div>
    </div>
    <dl className="case-decrypt-signals">
      <div data-wave-follow>
        <dt>Levels</dt>
        <dd><strong>3</strong><span>Hard · Veryhard · Hardest</span></dd>
      </div>
      <div data-wave-follow>
        <dt>Rule budget</dt>
        <dd><strong>10 / 11 / 12</strong><span>unlock in sequence</span></dd>
      </div>
      <div data-wave-follow>
        <dt>Time budget</dt>
        <dd><strong>10:00 → 05:00</strong><span>starts on first input</span></dd>
      </div>
    </dl>
  </header>
);

const DecryptModeRail = ({ project, media }: { project: ProjectRecord; media?: ProjectMedia }) => (
  <section
    className="case-decrypt-modes case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="decrypt-modes-title"
  >
    <StorySectionHead
      eyebrow="Choose the pressure"
      title="Each level trades more rules for less time."
      body="The role artwork changes with the selected level, but the timer still waits for the first input."
      id="decrypt-modes-title"
    />
    <div className="case-decrypt-modes__stage">
      {media ? (
        <CaseMediaFrame
          media={media}
          alt={`${project.title} mode selection`}
          sizes="(max-width: 900px) 100vw, 650px"
          className="case-media__frame--decrypt-modes"
          label="Actual level selection"
          kindLabel="Product · Still"
        />
      ) : null}
      <ol className="case-decrypt-levels">
        {DECRYPT_MODES.map((mode, index) => (
          <li
            className={`case-decrypt-level case-decrypt-level--${mode.tone}`}
            data-wave-follow
            style={{ '--mode-index': index }}
            key={mode.level}
          >
            <span className="case-decrypt-level__index">0{index + 1}</span>
            <div className="case-decrypt-level__identity">
              <span>{mode.level}</span>
              <strong>{mode.character}</strong>
            </div>
            <dl>
              <div><dt>Rules</dt><dd>{mode.rules}</dd></div>
              <div><dt>Time</dt><dd>{mode.time}</dd></div>
            </dl>
            <span className="case-decrypt-level__pressure" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const DecryptPressureChamber = () => (
  <section
    className="case-decrypt-engine case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="decrypt-engine-title"
  >
    <StorySectionHead
      eyebrow="Live validation loop"
      title="The same string is checked again on every edit."
      body="The first input arms the clock; every later edit can pass a new rule or invalidate an earlier one."
      id="decrypt-engine-title"
    />
    <div className="case-decrypt-engine__board">
      <article className="case-decrypt-engine__mode" data-wave-follow>
        <span>Selected pressure</span>
        <div>
          <Icon icon="lucide:terminal" aria-hidden="true" />
          <strong>HACKER</strong>
        </div>
        <small>12 live rules</small>
      </article>
      <div className="case-decrypt-engine__route case-decrypt-engine__route--mode" data-wave-follow aria-hidden="true">
        <span>selects</span>
        <Icon icon="lucide:arrow-right" />
      </div>
      <article
        className="case-decrypt-engine__password"
        data-wave-follow
        aria-label="Illustrative password validation diagram, not an application capture"
      >
        <span>Illustrative state · not a real capture</span>
        <div aria-label="Example password with a virus mutation during live validation">
          <strong>44437!Jul¥</strong>
          <span className="case-decrypt-engine__mutation-icon" aria-hidden="true">
            <Icon icon="lucide:bug" />
          </span>
          <b>_</b>
        </div>
        <small>@input re-runs the selected checker</small>
      </article>
      <article className="case-decrypt-engine__timer" data-wave-follow>
        <Icon icon="lucide:timer" aria-hidden="true" />
        <span>First input starts</span>
        <strong>05:00</strong>
        <small>toward 00:00</small>
      </article>
      <div className="case-decrypt-engine__route case-decrypt-engine__route--timer" data-wave-follow aria-hidden="true">
        <span>counts down</span>
        <Icon icon="lucide:arrow-right" />
      </div>
      <ol className="case-decrypt-rules" aria-label="Live rule progression">
        {DECRYPT_RULE_STACK.map((rule) => (
          <li className={`is-${rule.state}`} data-wave-follow key={rule.id}>
            <span>{rule.id}</span>
            <strong>{rule.label}</strong>
            <small>
              {rule.state === 'passed' ? 'correct' : rule.state === 'active' ? 'live now' : 'waiting'}
            </small>
            <Icon
              icon={rule.state === 'passed' ? 'lucide:check' : rule.state === 'active' ? 'lucide:radio' : 'lucide:lock-keyhole'}
              aria-hidden="true"
            />
          </li>
        ))}
      </ol>
    </div>
    <div className="case-decrypt-mutations">
      <div className="case-decrypt-mutations__head" data-wave-follow>
        <span>Hardest mutation branch</span>
        <h3>Rules 8 and 11 alter the password itself.</h3>
      </div>
      <ol>
        <li data-wave-follow>
          <span className="case-decrypt-mutations__symbol" aria-hidden="true"><Icon icon="lucide:bug" /></span>
          <div><strong>Clear the virus</strong><small>rule 8 · another character every 4 seconds</small></div>
          <Icon icon="lucide:arrow-right" aria-hidden="true" />
        </li>
        <li data-wave-follow>
          <span className="case-decrypt-mutations__symbol" aria-hidden="true"><Icon icon="lucide:flame" /></span>
          <div><strong>Put out the fire</strong><small>rule 11 · another character every 2 seconds</small></div>
          <Icon icon="lucide:arrow-right" aria-hidden="true" />
        </li>
        <li data-wave-follow>
          <span className="case-decrypt-mutations__symbol" aria-hidden="true"><Icon icon="lucide:crown" /></span>
          <div><strong>Add the crown</strong><small>rule 12 · exact crown character</small></div>
        </li>
      </ol>
    </div>
    <div className="case-decrypt-resolution">
      <StorySectionHead
        eyebrow="One burn, two verdicts"
        title="Success and timeout share the same fiery transition."
        body="Both paths replace the password character by character before the result overlay resolves the run."
        id="decrypt-resolution-title"
      />
      <div className="case-decrypt-resolution__flow" aria-labelledby="decrypt-resolution-title">
        <article className="case-decrypt-resolution__trigger" data-wave-follow>
          <span>Either trigger</span>
          <h3>All rules correct <i>or</i> clock at zero</h3>
          <p>Both conditions call the same burn function.</p>
        </article>
        <div className="case-decrypt-resolution__burn" data-wave-follow>
          <Icon icon="lucide:flame" aria-hidden="true" />
          <span>firePassword</span>
          <strong>one character every 50 ms</strong>
        </div>
        <div className="case-decrypt-outcomes" aria-label="Game outcomes">
          <article className="case-decrypt-outcome case-decrypt-outcome--win" data-wave-follow>
            <Icon icon="lucide:crown" aria-hidden="true" />
            <span>Completed rule count matches</span>
            <h3>Victory overlay</h3>
            <p>Win art, victory audio, then restart.</p>
          </article>
          <article className="case-decrypt-outcome case-decrypt-outcome--lose" data-wave-follow>
            <Icon icon="lucide:circle-x" aria-hidden="true" />
            <span>Completed rule count falls short</span>
            <h3>Game-over overlay</h3>
            <p>Loss art, lose audio, then restart.</p>
          </article>
        </div>
      </div>
    </div>
  </section>
);

const DecryptResolutionProof = ({ project, media }: { project: ProjectRecord; media?: ProjectMedia }) => {
  if (!media) return null;

  return (
    <section
      className="case-decrypt-manual case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 2 }}
      aria-labelledby="decrypt-manual-title"
    >
      <StorySectionHead
        eyebrow="Real product proof"
        title="The manual names the stakes before the timer starts."
        body="This captured opening step introduces the three level identities inside the actual game."
        id="decrypt-manual-title"
      />
      <div className="case-decrypt-manual__stage">
        <CaseMediaFrame
          media={media}
          alt={`${project.title} in-game manual opening step`}
          sizes="(max-width: 900px) 100vw, 760px"
          className="case-media__frame--decrypt-manual"
          label="Actual in-game manual · opening step"
          kindLabel="Product · Still"
        />
        <ol className="case-decrypt-manual__beats">
          <li data-wave-follow><span>01</span><strong>Choose one level identity</strong></li>
          <li data-wave-follow><span>02</span><strong>First input starts the timer</strong></li>
          <li data-wave-follow><span>03</span><strong>Burn, then show the verdict</strong></li>
        </ol>
      </div>
    </section>
  );
};

const DECRYPT_RUNTIME = [
  ['01', 'lucide:mouse-pointer-click', 'Browser input', 'Level buttons and one text field send every player choice into the client.'],
  ['02', 'lucide:component', 'Vue App.vue', 'Refs, input handlers, and watchEffect hold the timer, visible rules, sound, and result state.'],
  ['03', 'lucide:braces', 'Imported data.json', 'Three local objects provide the rules, character, visual tokens, and time budget.'],
  ['04', 'lucide:timer-reset', 'Browser APIs', 'setInterval drives the clock and mutations; Date and Audio supply the month rule and sound cues.'],
  ['05', 'lucide:monitor-check', 'Reactive verdict', 'Rule cards, the burn transition, and the win or game-over overlay close the run.'],
  ['06', 'lucide:rotate-ccw', 'Retry boundary', 'sessionStorage restores the selected level; input, timer, and rule progress start over.'],
];

const DecryptArchitecture = ({ techItems }: { techItems: string[] }) => (
  <section
    className="case-decrypt-architecture case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 2 }}
    aria-labelledby="decrypt-architecture-title"
  >
    <StorySectionHead
      eyebrow="Runtime truth"
      title="Everything happens inside one browser tab."
      body="There is no API or account system: Vue state, imported rule data, and browser APIs run the entire game."
      id="decrypt-architecture-title"
    />
    <ol className="case-decrypt-architecture__rail">
      {DECRYPT_RUNTIME.map(([step, icon, title, body]) => (
        <li data-wave-follow key={step}>
          <article>
            <header><span>{step}</span><Icon icon={icon} aria-hidden="true" /></header>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        </li>
      ))}
    </ol>
    <p className="case-decrypt-architecture__boundary" data-wave-follow>
      <Icon icon="lucide:shield-check" aria-hidden="true" />
      No backend, no durable game history, and no saved in-progress password.
    </p>
    <StackBlock items={techItems} reveal="scroll" revealIndex={2} title="Browser-built stack" />
  </section>
);

const DecryptLayout = ({ project, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => {
  const manualMedia = gallery[0];
  const modeMedia = gallery[1];

  return (
    <>
      <DecryptHero project={project} hasLive={hasLive} hasRepo={hasRepo} />
      <DecryptModeRail project={project} media={modeMedia} />
      <DecryptPressureChamber />
      <DecryptResolutionProof project={project} media={manualMedia} />
      <DecryptArchitecture techItems={techItems} />
    </>
  );
};



export default DecryptLayout;
