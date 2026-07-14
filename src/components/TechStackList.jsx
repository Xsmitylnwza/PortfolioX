import { Icon } from '@iconify/react';
import { resolveTechItems } from '../data/techIcons';
import './TechStackList.css';

const TechStackIconDefs = () => (
  <svg className="tech-stack-svg-defs" aria-hidden="true" focusable="false">
    <defs>
      <filter id="tech-stack-icon-plate" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="noise" />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0.91
                  0 0 0 0 0.88
                  0 0 0 0 0.82
                  0 0 0 0.08 0"
          result="grain"
        />
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.4" result="soft" />
        <feOffset in="soft" dx="0" dy="1" result="shadow" />
        <feFlood floodColor="#050505" floodOpacity="0.28" result="shadowColor" />
        <feComposite in="shadowColor" in2="shadow" operator="in" result="drop" />
        <feMerge>
          <feMergeNode in="drop" />
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="grain" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

/**
 * Shared Tech Stack presentation used by /stack and project case pages.
 *
 * @param {object} props
 * @param {Array<string | { label: string, icon?: string }>} props.items
 * @param {'index' | 'layer' | 'case'} [props.variant]
 * @param {string} [props.title]
 * @param {string} [props.ariaLabel]
 * @param {boolean} [props.showDefs]
 * @param {string} [props.className]
 * @param {boolean} [props.waveFollow]
 * @param {string | number} [props.revealIndex]
 * @param {'mount' | 'scroll'} [props.reveal]
 * @param {string} [props.phaseClassName] - extra class for each item (e.g. engine-phase)
 */
const TechStackList = ({
  items = [],
  variant = 'index',
  title,
  ariaLabel,
  showDefs = true,
  className = '',
  waveFollow = false,
  revealIndex,
  reveal,
  phaseClassName = '',
}) => {
  const tools = resolveTechItems(items);

  if (!tools.length) return null;

  const rootClass = [
    'tech-stack-list',
    `tech-stack-list--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const listLabel = ariaLabel || title || 'Technologies';
  const followProps = waveFollow ? { 'data-wave-follow': true } : {};
  const revealProps =
    reveal != null
      ? {
          'data-reveal': reveal,
          style: revealIndex != null ? { '--reveal-index': revealIndex } : undefined,
        }
      : {};

  return (
    <section className={rootClass} {...revealProps}>
      {showDefs && <TechStackIconDefs />}

      {title && (
        <h2 className="tech-stack-list__title" {...followProps}>
          {title}
        </h2>
      )}

      <ul className="tech-stack-list__items" aria-label={listLabel} {...followProps}>
        {tools.map((tool, index) => (
          <li
            key={tool.label}
            className={['tech-stack-list__item', phaseClassName].filter(Boolean).join(' ')}
            style={{ '--phase-index': index }}
          >
            <span className="tech-stack-list__icon" aria-hidden="true">
              <Icon icon={tool.icon} />
            </span>
            <span className="tech-stack-list__label">{tool.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export { TechStackIconDefs, resolveTechItems };
export default TechStackList;
