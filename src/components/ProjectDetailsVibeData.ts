const VIBE_KIND_LABEL = 'Fictional demo';
const VIBE_DEMO_NOTE = 'Fictional data and edited timing. The Studio shown is the approved prototype (mockup), not the released app.';

interface VibeApp {
  id: 'code' | 'figma' | 'music';
  app: string;
  icon: string;
  scene: string;
  line: string;
}

const VIBE_APPS: VibeApp[] = [
  { id: 'code', app: 'VS Code', icon: 'lucide:code-xml', scene: 'Coding', line: 'Paired Scene: Coding' },
  { id: 'figma', app: 'Figma', icon: 'lucide:figma', scene: 'Design', line: 'Paired Scene: Design' },
  { id: 'music', app: 'Spotify', icon: 'lucide:music-2', scene: 'Chill', line: 'Paired Scene: Chill' },
];

const VIBE_STEPS = [
  { step: 'Pair', icon: 'lucide:link-2', from: 'An app with no status', to: 'An app paired to a Scene' },
  { step: 'Detect', icon: 'lucide:app-window', from: 'Which window is in front', to: 'Foreground app, read locally' },
  { step: 'Choose', icon: 'lucide:history', from: 'Several paired apps open', to: 'Most recently used wins' },
  { step: 'Set', icon: 'lucide:radio', from: 'A Scene on your machine', to: 'Rich Presence through local RPC' },
];

const VIBE_EVIDENCE = [
  {
    metric: 'Idle companion CPU',
    from: '1.95%',
    to: '0.32%',
    unit: 'of 12 logical CPUs',
    note: 'After the foreground-detector rewrite.',
  },
  {
    metric: 'Focus-switch latency',
    from: 'up to 3.5 s',
    to: '0.26–0.54 s',
    unit: 'status follows focus',
    note: 'Measured on the owner’s machine.',
  },
  {
    metric: 'App launch',
    from: '3.3–5.5 s',
    to: '1.1–1.5 s',
    unit: 'app launch',
    note: 'Measured on the owner’s machine.',
  },
];

const VIBE_EVIDENCE_SOURCE = 'Source: the project’s P4-1 report and P0 footprint baseline (docs/improvement-review/execution/p4/P4-1.md, p0/footprint-baseline.md). One machine, one owner — not a benchmark.';

const VIBE_SYSTEM = [
  { stage: '01 · Shell', title: 'Desktop shell', icon: 'lucide:app-window', items: ['Electron'] },
  { stage: '02 · Detect', title: 'Foreground detector', icon: 'lucide:scan-eye', items: ['PowerShell', 'process + window'] },
  { stage: '03 · Decide', title: 'Companion', icon: 'lucide:cpu', items: ['Node ESM', 'recency rule'] },
  { stage: '04 · Present', title: 'Local Discord RPC', icon: 'lucide:radio', items: ['discord-rpc', 'local only'] },
  { stage: '05 · Edit', title: 'Studio', icon: 'lucide:layout-template', items: ['HTML / CSS / JS', 'no accounts'] },
];

export { VIBE_KIND_LABEL, VIBE_DEMO_NOTE, VIBE_APPS, VIBE_STEPS, VIBE_EVIDENCE, VIBE_EVIDENCE_SOURCE, VIBE_SYSTEM };
export type { VibeApp };
