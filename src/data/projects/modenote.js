export default {
    id: 'modenote',
    title: 'ModeNote',
    category: 'AI VOICE WORKSPACE • JUN 2026',
    year: 'JUN 2026',
    description: 'A context-aware voice workspace that turns Thai-English conversations into searchable, source-linked working memory.',
    fullDescription: 'ModeNote is a record-first conversation workspace. It keeps recoverable audio capture independent from best-effort live transcription, then turns stopped sessions into recaps, next steps, evidence cards, source-linked chat, local search, exports, and feature-gated read-only MCP access.',
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'Bun', 'Elysia', 'PostgreSQL', 'MinIO', 'Deepgram', 'Docker'],
    coverImage: '/assets/project-covers/modenote-cover-v3.webp',
    heroMedia: { image: '/assets/project-covers/modenote-cover-v3.webp', kind: 'cover' },
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
        image: '/assets/modenote/capture-context.jpg',
        video: '/assets/modenote/capture-context.mp4',
      },
      {
        image: '/assets/modenote/next-question-loop.jpg',
        video: '/assets/modenote/next-question-loop.mp4',
      },
      {
        image: '/assets/modenote/evidence-workspace.jpg',
        video: '/assets/modenote/evidence-workspace.mp4',
      },
      {
        image: '/assets/modenote/session-library.jpg',
        video: '/assets/modenote/session-library.mp4',
      },
    ],
    galleryLabels: ['Context before capture', 'The next-question loop', 'Recap, transcript search, and export', 'Searchable session memory'],
    galleryDescriptions: [
      'The real setup flow shows language, conversation mode, and AI assist changing before the microphone opens.',
      'A simulated landing preview illustrates how a Thai-English transcript and one suggested next question can share the same loop.',
      'The real workspace moves from recap to transcript search and export while the source session stays attached.',
      'Search session titles, filter, sort, and reopen recorded sessions as a working memory library instead of a folder of audio files.',
    ],
    role: 'Full Stack Developer',
  };
