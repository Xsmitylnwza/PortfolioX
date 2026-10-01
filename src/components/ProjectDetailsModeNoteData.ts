const MODENOTE_SHIFTS = [
  {
    step: 'Record',
    icon: 'lucide:mic-2',
    from: 'A recording to decode again',
    to: 'Text that follows the voice',
  },
  {
    step: 'Assist',
    icon: 'lucide:message-circle-question-mark',
    from: 'Questions thought of afterwards',
    to: 'One next question, sourced',
  },
  {
    step: 'Recap',
    icon: 'lucide:quote',
    from: 'Quotes found by scrubbing',
    to: 'Summary with evidence attached',
  },
  {
    step: 'Ask',
    icon: 'lucide:library-big',
    from: 'A folder of audio files',
    to: 'Answers that open their source',
  },
];

const MODENOTE_KIND_LABEL = 'Fictional demo';
const MODENOTE_DEMO_NOTE = 'One fictional Thai interview session. Clips use fictional data and edited timing.';

const MODENOTE_CONTEXT_PROOF = {
  eyebrow: 'Proof 01 · Record',
  summary: 'Status, timer and input level — then Thai lines confirm with times.',
  chips: ['Live status', 'Timer + meter', 'Timestamped Thai'],
};

const MODENOTE_CAPTURE_TILES = [
  {
    stage: 'Input',
    title: 'Microphone',
    body: 'One permission, two independent consumers.',
    icon: 'lucide:mic-2',
    items: ['MediaRecorder', 'PCM stream'],
  },
  {
    stage: 'Realtime path',
    title: 'PCM frames',
    body: 'Live transcript, best-effort.',
    icon: 'lucide:audio-lines',
    items: ['best-effort', 'low latency'],
  },
  {
    stage: 'Durable path',
    title: '4-second WebM chunks',
    body: 'Recovery queue; still usable when realtime drops.',
    icon: 'lucide:shield-check',
    items: ['recoverable', 'independent'],
  },
  {
    stage: 'Shared truth',
    title: 'Timestamped session',
    body: 'Audio, ordered transcript, versioned input.',
    icon: 'lucide:git-merge',
    items: ['capture', 'transcript', 'evidence'],
    focus: true,
  },
];

const MODENOTE_INTERFACE_PROOF = [
  { galleryIndex: 1, step: 'Assist', caption: 'One suggested question, beside its source quote.' },
  { galleryIndex: 2, step: 'Recap', caption: 'Overview, next step, evidence with a time.' },
  { galleryIndex: 3, step: 'Ask', caption: 'Chained answers. A time chip opens the source player.' },
];

const MODENOTE_SYSTEM_NODES = [
  {
    stage: '01 · Capture',
    title: 'Browser session',
    icon: 'lucide:mic-2',
    items: ['4s WebM chunks', 'PCM frames'],
  },
  {
    stage: '02 · Route',
    title: 'API + realtime gateway',
    icon: 'lucide:waypoints',
    items: ['Elysia API', 'WebSocket STT'],
  },
  {
    stage: '03 · Persist',
    title: 'Session truth',
    icon: 'lucide:database',
    items: ['PostgreSQL', 'MinIO'],
  },
  {
    stage: '04 · Analyze',
    title: 'Background worker',
    icon: 'lucide:cpu',
    items: ['versioned artifacts', 'source refs'],
  },
  {
    stage: '05 · Reuse',
    title: 'Workspace + gated MCP',
    icon: 'lucide:network',
    items: ['human workspace', 'read-only MCP'],
  },
];

const MODENOTE_MCP_SIGNALS = [
  { icon: 'lucide:badge-check', label: 'Consent + token' },
  { icon: 'lucide:list-filter', label: 'Stopped only' },
  { icon: 'lucide:user-round-check', label: 'Owner scoped' },
  { icon: 'lucide:shield-off', label: 'Revoke + expiry' },
];

export {
  MODENOTE_SHIFTS, MODENOTE_KIND_LABEL, MODENOTE_DEMO_NOTE, MODENOTE_CONTEXT_PROOF, MODENOTE_CAPTURE_TILES,
  MODENOTE_INTERFACE_PROOF, MODENOTE_SYSTEM_NODES, MODENOTE_MCP_SIGNALS,
};
