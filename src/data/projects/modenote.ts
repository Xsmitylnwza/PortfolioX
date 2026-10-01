import type { ProjectRecord } from '../projectTypes';

const project = {
    id: 'modenote' as const,
    title: 'ModeNote',
    category: 'AI VOICE WORKSPACE • JUN 2026',
    year: 'JUN 2026',
    description: 'A context-aware voice workspace that turns Thai-English conversations into searchable, source-linked working memory.',
    fullDescription: 'ModeNote is a record-first conversation workspace. It keeps recoverable audio capture independent from best-effort live transcription, then turns stopped sessions into recaps, next steps, evidence cards, source-linked chat, local search, exports, and feature-gated read-only MCP access.',
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'Bun', 'Elysia', 'PostgreSQL', 'MinIO', 'Deepgram', 'Docker'],
    coverImage: '/assets/project-covers/modenote-cover-v7.webp',
    heroMedia: { image: '/assets/project-covers/modenote-cover-v7.webp', kind: 'cover' },
    link: null,
    liveStatus: 'maintenance',
    liveNotice: 'Under maintenance — not open for use yet.',
    code: `// Live transcription is best-effort; durable audio capture remains independent.
const recorder = new MediaRecorderCtor(stream, { mimeType: "audio/webm" });
recorder.ondataavailable = (event) => {
  this.trackChunk(event.data, captureContext);
};
recorder.start(4000);

this.pcmStreamer = await this.createPcmStreamer(stream, {
  onChunk: (chunk) => this.sendRealtimePcm(chunk, captureContext),
  onLevel: (audioLevel) => this.updateSnapshot({ audioLevel }),
});`,
    gallery: [
      {
        image: '/assets/modenote/demo-v2/01-live-transcript.poster.png',
        video: '/assets/modenote/demo-v2/01-live-transcript.mp4',
      },
      {
        image: '/assets/modenote/demo-v2/02-live-assist.poster.png',
        video: '/assets/modenote/demo-v2/02-live-assist.mp4',
      },
      {
        image: '/assets/modenote/demo-v2/03-session-summary.poster.png',
        video: '/assets/modenote/demo-v2/03-session-summary.mp4',
      },
      {
        image: '/assets/modenote/demo-v2/04-ask-evidence.poster.png',
        video: '/assets/modenote/demo-v2/04-ask-evidence.mp4',
      },
    ],
    galleryLabels: ['Record, and the text follows', 'Listen, then suggest the next question', 'Stop, and see what to do next', 'Ask on, then check the source'],
    galleryDescriptions: [
      'A recording dock shows status, timer and input level while Thai lines confirm with timestamps.',
      'The assist drawer suggests one next question beside the source quote it came from.',
      'The overview builds, then a summary, one next step and evidence with a time appear.',
      'Chained questions return answers with time chips; a time chip opens the source player at that moment.',
    ],
    role: 'Full Stack Developer',
  } satisfies ProjectRecord;
export default project;
