const MODENOTE_CAPTURE_CONTEXT = [
  {
    label: 'Mode',
    title: 'Tell the system what kind of room this is.',
    body: 'A general note, discovery call, interview, or structured conversation needs a different analytical lens.',
    icon: 'lucide:sliders-horizontal',
  },
  {
    label: 'Assist',
    title: 'Choose how visible the AI should be.',
    body: 'Keep capture quiet or ask for balanced live guidance without changing the durable recording path.',
    icon: 'lucide:sparkles',
  },
  {
    label: 'Language',
    title: 'Preserve the way people actually speak.',
    body: 'Thai-English code switching stays in one timestamped timeline instead of being translated into a different conversation.',
    icon: 'lucide:languages',
  },
];

const MODENOTE_REQUIREMENT_FLOW = [
  {
    label: 'Speak',
    title: 'Customer speaks',
    body: 'Pain, intent, and constraints enter the room in the customer’s own words.',
    icon: 'lucide:messages-square',
  },
  {
    label: 'Preserve',
    title: 'Transcript keeps the thread',
    body: 'Thai, English, and the timestamp stay together while the conversation moves on.',
    icon: 'lucide:captions',
  },
  {
    label: 'Ground',
    title: 'Live Assist offers one question',
    body: 'Each rolling analysis can return zero or one evidence-grounded question—not a stream of prompts.',
    icon: 'lucide:sparkles',
  },
  {
    label: 'Decide',
    title: 'The human chooses',
    body: 'The interviewer decides whether the suggestion belongs in the conversation.',
    icon: 'lucide:circle-help',
  },
  {
    label: 'Prove',
    title: 'Support stays attached',
    body: 'Derived requirements retain supporting evidence, strength, and a recommended next step.',
    icon: 'lucide:quote',
  },
];

const MODENOTE_CAPTURE_PATHS = [
  {
    label: 'Realtime path',
    title: 'PCM frames',
    body: 'Provider-ready audio frames stream over the live channel for interim and final transcript segments.',
    cue: 'best-effort · low latency',
    icon: 'lucide:audio-lines',
    tone: 'live',
  },
  {
    label: 'Durable path',
    title: '4-second WebM chunks',
    body: 'MediaRecorder chunks enter a local recovery queue, upload idempotently, and remain usable when realtime drops.',
    cue: 'recoverable · independent',
    icon: 'lucide:shield-check',
    tone: 'durable',
  },
];

const MODENOTE_WORKSPACE_STEPS = [
  {
    stage: '01',
    title: 'Review the recap',
    body: 'Open the stopped session and read its generated overview before returning to the source conversation.',
    icon: 'lucide:notebook-text',
  },
  {
    stage: '02',
    title: 'Search the transcript',
    body: 'Use local text search to find a phrase inside the current session and move back into its transcript.',
    icon: 'lucide:search',
  },
  {
    stage: '03',
    title: 'Export Markdown',
    body: 'Carry the session into a human-readable note without leaving the review workspace.',
    icon: 'simple-icons:markdown',
  },
  {
    stage: '04',
    title: 'Export JSON',
    body: 'Create a structured handoff when another tool needs the session data.',
    icon: 'lucide:braces',
  },
];

const MODENOTE_STACK_LAYERS = [
  {
    layer: 'Product interface',
    title: 'Next.js 16 + React 19',
    body: 'Composes the authenticated capture flow, session library, and post-session review workspace.',
    icons: ['simple-icons:nextdotjs', 'simple-icons:react'],
  },
  {
    layer: 'Shared contracts',
    title: 'TypeScript',
    body: 'Carries shared contracts and domain boundaries across the web, API, worker, and packages.',
    icons: ['simple-icons:typescript'],
  },
  {
    layer: 'API runtime',
    title: 'Bun + Elysia',
    body: 'Serves product APIs, uploads, the realtime WebSocket gateway, and feature-gated MCP routes.',
    icons: ['simple-icons:bun', 'skill-icons:elysia-light'],
  },
  {
    layer: 'Durable state',
    title: 'PostgreSQL',
    body: 'Stores sessions, manifests, final transcript segments, versioned artifacts, and worker job state.',
    icons: ['simple-icons:postgresql'],
  },
  {
    layer: 'Audio objects',
    title: 'MinIO',
    body: 'Keeps private audio chunks and composed recordings behind an S3-compatible storage boundary.',
    icons: ['simple-icons:minio'],
  },
  {
    layer: 'Live speech',
    title: 'Deepgram',
    body: 'Receives 16 kHz PCM for best-effort realtime transcription while durable recording stays independent.',
    icons: ['simple-icons:deepgram'],
  },
  {
    layer: 'Runtime packaging',
    title: 'Docker',
    body: 'Docker Compose packages the web, API, worker, and supporting services for the VPS runtime.',
    icons: ['simple-icons:docker'],
  },
];

const MODENOTE_MEMORY_EXITS = [
  {
    label: 'Find',
    title: 'Search session titles',
    body: 'Search by title, filter and sort the library, then reopen the full session workspace.',
    icon: 'lucide:search',
  },
  {
    label: 'Ask',
    title: 'Source-linked chat',
    body: 'Ask follow-up questions while source chips stay visible.',
    icon: 'lucide:message-circle-question-mark',
  },
  {
    label: 'Carry',
    title: 'Markdown + JSON',
    body: 'Export a human-readable note or a structured machine handoff.',
    icon: 'lucide:file-output',
  },
  {
    label: 'Delegate',
    title: 'Feature-gated MCP',
    body: 'When enabled, grant read-only access to all or selected stopped sessions with expiry, scope, and audit events.',
    icon: 'lucide:bot',
  },
];

const MODENOTE_SYSTEM_NODES = [
  {
    stage: '01 · Capture',
    title: 'Browser session',
    body: 'One microphone feeds recoverable MediaRecorder chunks and a separate realtime PCM stream.',
    icon: 'lucide:mic-2',
    items: ['4s WebM chunks', 'PCM frames'],
  },
  {
    stage: '02 · Route',
    title: 'API + realtime gateway',
    body: 'The product API accepts capture writes while the WebSocket gateway handles best-effort live transcription.',
    icon: 'lucide:waypoints',
    items: ['Elysia API', 'WebSocket STT'],
  },
  {
    stage: '03 · Persist',
    title: 'Session truth',
    body: 'PostgreSQL records sessions, manifests, transcript segments, and artifacts; MinIO stores durable audio.',
    icon: 'lucide:database',
    items: ['PostgreSQL', 'MinIO'],
  },
  {
    stage: '04 · Analyze',
    title: 'Background worker',
    body: 'PostgreSQL-backed jobs turn versioned transcript data into recaps, evidence, and Live Assist artifacts.',
    icon: 'lucide:cpu',
    items: ['versioned artifacts', 'source refs'],
  },
  {
    stage: '05 · Reuse',
    title: 'Workspace + gated MCP',
    body: 'People review and export in ModeNote. A feature flag can expose bounded read-only context to an agent.',
    icon: 'lucide:network',
    items: ['human workspace', 'read-only MCP'],
  },
];

const MODENOTE_MCP_PIPELINE = [
  {
    stage: '01 · Authorize',
    title: 'Create a consent-backed grant.',
    body: 'Choose selected stopped sessions or the full stopped-session library, set expiry, and retain the ability to revoke.',
    icon: 'lucide:key-round',
    items: ['Stopped sessions', 'Expiry', 'Revocable token'],
    next: 'authorizes',
    tone: 'grant',
  },
  {
    stage: '02 · Retrieve',
    title: 'ModeNote serves bounded context.',
    body: 'When MCP_ENABLED is on, the read-only surface enforces the grant and returns source-linked context instead of an unscoped transcript dump.',
    icon: 'lucide:server-cog',
    items: [
      'search_context',
      'search_evidence',
      'get_supported_requirements',
      'get_transcript_segments',
    ],
    next: 'grounds',
    tone: 'server',
  },
  {
    stage: '03 · Hand off',
    title: 'The agent works outside ModeNote.',
    body: 'ModeNote supplies read-only context and source references. Any document or code change happens in the agent’s own workspace.',
    icon: 'lucide:bot',
    prompt: 'Read-only context in · no ModeNote writes out',
    tone: 'agent',
  },
];

const MODENOTE_MCP_GUARDRAILS = [
  { icon: 'lucide:badge-check', label: 'Consent + token' },
  { icon: 'lucide:list-filter', label: 'Stopped only' },
  { icon: 'lucide:user-round-check', label: 'Owner scoped' },
  { icon: 'lucide:scan-text', label: 'Bounded transcript' },
  { icon: 'lucide:scroll-text', label: 'Audit events' },
  { icon: 'lucide:shield-off', label: 'Revoke + expiry' },
];

const MODENOTE_DEMO_STEPS = [
  {
    galleryIndex: 0,
    phase: 'capture',
    stage: '01 · Frame the room',
    eyebrow: 'Before capture',
    title: 'Set the language, mode, and assist level.',
    body: 'These choices shape the session before the microphone opens, so context does not have to be reconstructed afterward.',
    facts: ['Thai + English', 'Mode-aware analysis', 'Assist stays adjustable'],
    kindLabel: 'Recorded flow',
    icon: 'lucide:sliders-horizontal',
    signal: 'Context becomes part of capture—not cleanup after the call.',
    layout: 'wide',
  },
  {
    galleryIndex: 1,
    phase: 'capture',
    stage: '02 · Stay in the conversation',
    eyebrow: 'During the conversation',
    title: 'Surface one grounded question—not a wall of prompts.',
    body: 'The customer-discovery preview shows the intended human-in-the-loop: ModeNote suggests, and the interviewer decides.',
    facts: ['Zero or one suggestion', 'Recent transcript grounding', 'Simulated product preview'],
    kindLabel: 'Simulated preview',
    icon: 'lucide:message-circle-question-mark',
    signal: 'Guidance remains optional, visible, and source-aware.',
    layout: 'reverse',
  },
  {
    galleryIndex: 2,
    phase: 'memory',
    stage: '03 · Stop with evidence',
    eyebrow: 'After recording',
    title: 'Review the recap, then return to the transcript.',
    body: 'The recorded flow moves from recap to transcript search and export without leaving the stopped-session workspace.',
    facts: ['Bilingual transcript', 'Local text search', 'Markdown + JSON handoff'],
    kindLabel: 'Recorded flow',
    icon: 'lucide:quote',
    signal: 'Every useful handoff still begins with the captured session.',
    layout: 'climax',
  },
  {
    galleryIndex: 3,
    phase: 'memory',
    stage: '04 · Return without replaying',
    eyebrow: 'Later, when the conversation matters again',
    title: 'Find the session without remembering a filename.',
    body: 'Search, filter, and sort the library, then reopen the same workspace when the conversation becomes relevant again.',
    facts: ['Search by title', 'Filter + sort', 'Reopen the full workspace'],
    kindLabel: 'Recorded flow',
    icon: 'lucide:library-big',
    signal: 'A conversation becomes working memory only when it is easy to return to.',
    layout: 'epilogue',
  },
];

const MODENOTE_DEMO_CHAPTERS = {
  capture: {
    eyebrow: 'Before + during capture · Two product moments',
    title: 'Set the context. Then stay in the conversation.',
    body: 'First choose how the room should be understood. During capture, ModeNote can surface at most one grounded question without taking over.',
  },
  memory: {
    eyebrow: 'The stopped session · Two return paths',
    title: 'The recording stops. The work keeps moving.',
    body: 'Review and export inside the stopped session, then use the library to return when that conversation matters again.',
  },
};

export {
  MODENOTE_CAPTURE_CONTEXT, MODENOTE_REQUIREMENT_FLOW, MODENOTE_CAPTURE_PATHS,
  MODENOTE_WORKSPACE_STEPS, MODENOTE_STACK_LAYERS, MODENOTE_MEMORY_EXITS,
  MODENOTE_SYSTEM_NODES, MODENOTE_MCP_PIPELINE, MODENOTE_MCP_GUARDRAILS,
  MODENOTE_DEMO_STEPS, MODENOTE_DEMO_CHAPTERS,
};
