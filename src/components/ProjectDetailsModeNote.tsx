import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { CaseSplitHero, StackBlock } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';
import { MODENOTE_SHIFTS, MODENOTE_SYSTEM_NODES, MODENOTE_MCP_SIGNALS } from './ProjectDetailsModeNoteData';
import { ModeNoteSectionHead, ModeNoteContextProof, ModeNoteDualCapture, ModeNoteInterfaceProof } from './ProjectDetailsModeNoteProofs';
import type { CaseLayoutProps } from '../features/project-details/types';

const ModeNoteShifts = () => (
  <section
    className="case-modenote-shifts case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="modenote-shifts-title"
  >
    <ModeNoteSectionHead eyebrow="The shift" title="Voice notes save the sound—not the work inside it." id="modenote-shifts-title" />
    <ol className="case-modenote-shifts__grid" aria-label="Record, assist, recap, ask">
      {MODENOTE_SHIFTS.map((item, index) => (
        <li className="case-modenote-shift" data-surface="base" data-surface-sheen="" data-wave-follow key={item.step}>
          <span className="case-modenote-shift__index" data-surface-positioned="">{formatIndex(index + 1)} · {item.step}</span>
          <Icon data-surface-positioned="" className="case-modenote-shift__icon" icon={item.icon} aria-hidden="true" />
          <div className="case-modenote-shift__copy">
            <span>{item.from}</span>
            <Icon icon="lucide:arrow-right" aria-hidden="true" />
            <strong>{item.to}</strong>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

const ModeNoteSystem = () => (
  <section
    className="case-modenote-system case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="modenote-system-title"
  >
    <ModeNoteSectionHead eyebrow="System" title="One session truth, bounded at every reader." id="modenote-system-title" />
    <div className="case-modenote-rail" data-surface="base" data-surface-sheen="" data-wave-follow>
      <div className="case-modenote-rail__copy">
        <span>Optional MCP · Feature-gated</span>
        <strong>Read-only context in. No writes out.</strong>
      </div>
      <ul aria-label="ModeNote MCP access safeguards">
        {MODENOTE_MCP_SIGNALS.map((signal) => (
          <li data-surface="dark" key={signal.label}>
            <span className="case-modenote-rail__mark" data-surface="dark" aria-hidden="true">
              <Icon icon={signal.icon} />
            </span>
            <strong>{signal.label}</strong>
          </li>
        ))}
      </ul>
    </div>
    <ol className="case-modenote-nodes" aria-label="ModeNote runtime architecture">
      {MODENOTE_SYSTEM_NODES.map((node) => (
        <li className="case-modenote-node" data-surface="base" data-surface-sheen="" data-wave-follow key={node.stage}>
          <span className="case-modenote-node__stage">{node.stage}</span>
          <span className="case-modenote-node__icon" data-surface="dark" aria-hidden="true">
            <Icon icon={node.icon} />
          </span>
          <h3>{node.title}</h3>
          <ul className="case-modenote-chips" aria-label={`${node.title} implementation details`}>
            {node.items.map((item) => <li data-surface="dark" key={item}>{item}</li>)}
          </ul>
        </li>
      ))}
    </ol>
  </section>
);

const ModeNoteLayout = ({ project, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => (
  <>
    <CaseSplitHero hasLive={hasLive} hasRepo={hasRepo} project={project} alt={`${project.title} poster: a recording window with a Thai–English transcript beside the session summary it produced, the same quote highlighted in both`} />

    <ModeNoteShifts />
    <ModeNoteContextProof project={project} media={gallery[0]} />
    <ModeNoteDualCapture />
    <ModeNoteInterfaceProof project={project} gallery={gallery} />
    <ModeNoteSystem />
    <StackBlock items={techItems} reveal="scroll" revealIndex={1} title="Built with" />
  </>
);

export default ModeNoteLayout;
