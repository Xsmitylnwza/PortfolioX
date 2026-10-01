import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { StorySectionHead } from './ProjectDetailsPrimitives';
import { CaseActions, StackBlock } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';
import type { CaseLayoutProps } from '../features/project-details/types';

const ZUCH_WORKFLOW = [
  {
    icon: 'lucide:search',
    label: 'Browse',
    title: 'Find a title through search or a genre shelf',
    body: 'The browser reads popular titles and film metadata from TMDB, then groups the catalogue into browsable shelves.',
    cue: 'TMDB read',
  },
  {
    icon: 'lucide:film',
    label: 'Open',
    title: 'Move from a poster into one film context',
    body: 'The title view combines movie details, cast and trailer data with the ratings and written reviews already stored for that film.',
    cue: 'one movieId',
  },
  {
    icon: 'lucide:sliders-horizontal',
    label: 'Review',
    title: 'A signed-in person sets five scores and writes once',
    body: 'Five independent 0–100 sliders and one written review are the only inputs; the human chooses when to submit.',
    cue: 'human write',
  },
];

const ZUCH_REVIEW_AXES = [
  {
    label: 'Entertainment',
    icon: 'lucide:popcorn',
  },
  {
    label: 'Movie Chapter',
    icon: 'lucide:book-open',
  },
  {
    label: 'Performance',
    icon: 'lucide:drama',
  },
  {
    label: 'Production',
    icon: 'lucide:clapperboard',
  },
  {
    label: 'Worthiness',
    icon: 'lucide:ticket-check',
  },
];

const ZUCH_ARCHITECTURE_NODES = [
  {
    id: 'client',
    eyebrow: 'Browser client',
    title: 'Vue Router + Pinia',
    body: 'Routes, fetch utilities, review state, and the current user all live in the Vue application.',
    tags: ['Vue 3', 'Pinia', 'localStorage'],
    icon: 'lucide:panel-top',
  },
  {
    id: 'tmdb',
    eyebrow: 'External read',
    title: 'TMDB',
    body: 'The browser requests discovery, search, movie details, credits, videos, posters, and backdrops.',
    tags: ['catalogue', 'details', 'media'],
    icon: 'lucide:database',
  },
  {
    id: 'review',
    eyebrow: 'Client processing',
    title: 'ReviewManagement',
    body: 'In-memory code averages each category, derives the ordinary five-category mean, sorts reviews, and pages the list.',
    tags: ['mean', 'sort', 'page'],
    icon: 'lucide:calculator',
  },
  {
    id: 'supabase',
    eyebrow: 'Direct data access',
    title: 'Supabase tables',
    body: 'The browser reads and writes users, genres, ratings, reviews, and liked-review relationships directly.',
    tags: ['users', 'ratings', 'reviews'],
    icon: 'lucide:table-properties',
  },
];

const getZuchPoster = (media: ProjectMedia | undefined) => (typeof media === 'string' ? media : media?.image);

const ProjectZuchArchitecture = () => (
  <section
    className="case-zucchini-architecture case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="zucchini-architecture-title"
  >
    <StorySectionHead
      eyebrow="Implementation truth"
      title="The browser is the integration boundary."
      body="There is no custom application server in this path: Vue calls TMDB and Supabase directly, then calculates the review presentation in memory."
      id="zucchini-architecture-title"
      className="case-zucchini-head"
    />

    <div className="case-zucchini-architecture__map">
      <div className="case-zucchini-architecture__connections" data-wave-follow aria-hidden="true">
        <svg viewBox="0 0 1000 520" preserveAspectRatio="none">
          <path d="M500 165 C500 225 190 200 190 285" />
          <path d="M500 165 L500 285" />
          <path d="M500 165 C500 225 810 200 810 285" />
        </svg>
      </div>
      {ZUCH_ARCHITECTURE_NODES.map((node) => (
        <article
          className={`case-zucchini-architecture__slot case-zucchini-architecture__slot--${node.id}`}
          data-wave-follow
          key={node.id}
        >
          <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass case-zucchini-architecture__node">
            <header>
              <span data-surface="dark" aria-hidden="true"><Icon icon={node.icon} /></span>
              <small>{node.eyebrow}</small>
            </header>
            <h3>{node.title}</h3>
            <p>{node.body}</p>
            <ul aria-label={`${node.title} signals`}>
              {node.tags.map((tag) => <li data-surface="dark" key={tag}>{tag}</li>)}
            </ul>
          </div>
        </article>
      ))}
    </div>

    <aside className="case-zucchini-architecture__boundary" data-wave-follow>
      <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass">
        <Icon data-surface-positioned="" icon="lucide:shield-alert" aria-hidden="true" />
        <div>
          <span>Identity boundary</span>
          <strong>Pinia restores a browser-local user object; this project does not use Supabase Auth, server sessions, or a custom backend.</strong>
        </div>
      </div>
    </aside>
  </section>
);

const ProjectZuchWorkflow = () => (
  <section
    className="case-zucchini-workflow case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="zucchini-workflow-title"
  >
    <StorySectionHead
      eyebrow="Browse → open → review"
      title="A poster becomes a film context before it becomes an opinion."
      body="Discovery remains public. Writing is an explicit, signed-in action on one selected movie."
      id="zucchini-workflow-title"
      className="case-zucchini-head"
    />
    <ol className="case-zucchini-workflow__rail">
      {ZUCH_WORKFLOW.map((item, index) => (
        <li data-wave-follow key={item.label}>
          <article data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass case-zucchini-workflow__card">
            <header>
              <span>{formatIndex(index + 1)}</span>
              <Icon icon={item.icon} aria-hidden="true" />
            </header>
            <small>{item.label}</small>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <footer>{item.cue}</footer>
          </article>
        </li>
      ))}
    </ol>
  </section>
);

const ProjectZuchReviewLoop = () => (
  <section
    className="case-zucchini-loop case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="zucchini-loop-title"
  >
    <StorySectionHead
      eyebrow="Human-controlled review loop"
      title="Five ratings and one written review become a visible result."
      body="The interface records the person’s input, the browser calculates ordinary means, and the same person decides whether to edit or delete later."
      id="zucchini-loop-title"
      className="case-zucchini-head"
    />

    <div
      className="case-zucchini-loop__map"
      aria-label="Review loop from human rating input through stored rows and client-side averaging to a visible result and later edit or delete"
    >
      <div className="case-zucchini-loop__connections" data-wave-follow aria-hidden="true">
        <svg viewBox="0 0 1200 760" preserveAspectRatio="none">
          <path d="M280 175 L280 530" />
          <path d="M365 610 C445 610 440 445 485 405" />
          <path d="M715 350 C790 310 790 175 850 175" />
          <path d="M930 245 L930 530" />
          <path d="M850 625 C720 710 455 710 330 640 C160 545 85 395 150 270" />
        </svg>
      </div>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--input" data-wave-follow>
        <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass case-zucchini-loop__node">
          <header><span data-surface="dark">01</span><small>Human input</small></header>
          <h3>Rate the film</h3>
          <ul className="case-zucchini-loop__axes" aria-label="Five Zucchinitor rating categories">
            {ZUCH_REVIEW_AXES.map((axis) => (
              <li data-surface="dark" key={axis.label}>
                <Icon icon={axis.icon} aria-hidden="true" />
                <span>{axis.label}</span>
                <small>0–100</small>
              </li>
            ))}
          </ul>
          <p>One text field carries the written review. It is not a separate comment thread.</p>
        </div>
      </article>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--rows" data-wave-follow>
        <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass case-zucchini-loop__node">
          <header><span data-surface="dark">02</span><small>Captured rows</small></header>
          <h3>Rating + review</h3>
          <p>Supabase stores a rating row first, then a review row carrying movieId, userId, ratingId, text, and likeCount.</p>
          <ul className="case-zucchini-loop__tags">
            <li data-surface="dark">ratings</li><li data-surface="dark">reviews</li><li data-surface="dark">movieId</li>
          </ul>
        </div>
      </article>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--mean" data-wave-follow>
        <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass case-zucchini-loop__node case-zucchini-loop__node--core">
          <header>
            <span data-surface="dark" aria-hidden="true"><Icon icon="lucide:calculator" /></span>
            <small>03 · Browser calculation</small>
          </header>
          <h3>Zucchinitor</h3>
          <div className="case-zucchini-loop__formula" aria-label="Ordinary mean of the five category averages">
            <span>mean of every review per category</span>
            <Icon icon="lucide:arrow-down" aria-hidden="true" />
            <strong>ordinary mean of 5 category averages</strong>
          </div>
          <p>No weighting, critic tier, or recommendation model is added.</p>
        </div>
      </article>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--result" data-wave-follow>
        <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass case-zucchini-loop__node">
          <header><span data-surface="dark">04</span><small>Visible result</small></header>
          <h3>Score + reviews</h3>
          <p>The movie view renders the five category means, the overall mean, review text, likes, sorting, and three-at-a-time pagination.</p>
          <ul className="case-zucchini-loop__tags">
            <li data-surface="dark">most liked</li><li data-surface="dark">high / low</li><li data-surface="dark">3 per page</li>
          </ul>
        </div>
      </article>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--revisit" data-wave-follow>
        <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass case-zucchini-loop__node">
          <header><span data-surface="dark">05</span><small>Next choice</small></header>
          <h3>Revisit Reviewed</h3>
          <p>The signed-in person can reopen the review editor or explicitly delete a review from their own Reviewed list.</p>
          <ul className="case-zucchini-loop__tags">
            <li data-surface="dark">edit</li><li data-surface="dark">delete</li><li data-surface="dark">human decides</li>
          </ul>
        </div>
      </article>
    </div>

    <aside className="case-zucchini-loop__control" data-wave-follow>
      <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass">
        <Icon data-surface-positioned="" icon="lucide:user-round-check" aria-hidden="true" />
        <span>Every create, edit, like, and delete starts with a person. The product does not act autonomously.</span>
      </div>
    </aside>
  </section>
);

const ProjectZuchEvidence = ({ project, gallery }: { project: ProjectRecord; gallery: ProjectMedia[] }) => {
  const items = gallery.map((media, index) => ({
    image: getZuchPoster(media),
    label: project.galleryLabels?.[index] || `Feature ${index + 1}`,
    description: project.galleryDescriptions?.[index],
    origin: project.galleryKinds?.[index] || 'Repository demo still',
  }));

  if (!items.some((item) => item.image)) return null;

  return (
    <section
      className="case-zucchini-proof case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 2 }}
      aria-labelledby="zucchini-proof-title"
    >
      <StorySectionHead
        eyebrow="Real interface proof"
        title="The aggregate stays beside the reviews that produced it."
        body="The current deployment is shown in the hero. These labelled repository demo stills document the review result and the signed-in return path."
        id="zucchini-proof-title"
        className="case-zucchini-head"
      />
      <div className="case-zucchini-proof__grid">
        {items.filter((item) => item.image).map((item, index) => (
          <article
            className={`case-zucchini-proof__item ${index === 0 ? 'case-zucchini-proof__item--lead' : ''}`}
            key={item.label}
          >
            <CaseMediaFrame
              image={item.image}
              alt={`${project.title} ${item.label} application screen`}
              sizes={index === 0 ? '(max-width: 900px) 100vw, 760px' : '(max-width: 900px) 100vw, 420px'}
              className="case-media__frame--zucchini-proof"
              label={item.label}
              kindLabel={item.origin}
            />
            <div className="case-zucchini-proof__copy" data-wave-follow>
              <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass">
                <span>{item.origin}</span>
                <h3>{item.label}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const ZuchLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => {
  return (
    <>
      <div className="case-zucchini-hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
        <div className="case-zucchini-hero__copy" data-wave-follow>
          <p className="case-kicker">{project.category || 'Selected system'}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="case-role">Team project · {project.role || 'Frontend Developer'}</p>
          <p className="case-lede">{project.description}</p>
          {decision && <p className="case-zucchini-hero__thesis">{decision}</p>}
          <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
        </div>
        <div className="case-zucchini-hero__visual">
          <CaseMediaFrame
            media={project.heroMedia}
            alt={`${project.title} current deployed homepage showing search, a recommended film, five rating categories, and a genre shelf`}
            eager
            sizes="(max-width: 900px) 100vw, 760px"
            className="case-media__frame--zucchini-hero"
            label="Current deployed homepage"
            kindLabel="Live still"
            transitionTarget
          />
          <aside className="case-zucchini-hero__caption" data-wave-follow>
            <div data-surface="base" data-surface-sheen="" data-surface-anchor="" className="case-zucchini-glass">
              <span>Live still · Anonymous view</span>
              <strong>Search, a recommended title, five visible rating axes, and genre shelves share the first screen.</strong>
              <p>The current live proof is limited to this public discovery surface; repository demo stills below document the signed-in review path.</p>
            </div>
          </aside>
        </div>
      </div>

      <ProjectZuchWorkflow />
      <ProjectZuchReviewLoop />
      <ProjectZuchEvidence project={project} gallery={gallery} />
      <ProjectZuchArchitecture />
      <StackBlock items={techItems} reveal="scroll" revealIndex={2} title="Built in the browser" />
    </>
  );
};


export default ZuchLayout;
