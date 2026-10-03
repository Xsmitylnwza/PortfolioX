import type { ProjectRecord } from '../projectTypes';

const project = {
    id: 'vibe-studio' as const,
    title: 'Vibe Studio',
    category: 'WINDOWS COMPANION • 2026',
    year: '2026',
    description: 'A Windows companion that sets your Discord Rich Presence from the app you are using — pair apps to Scenes, and the most recently used one wins.',
    fullDescription: 'Vibe Studio is a single-owner Windows companion for Discord Rich Presence. You pair apps to Scenes; a PowerShell-based foreground detector watches which paired app you used most recently, and the companion sets that Scene as your status through local Discord RPC. It runs as an Electron desktop shell around a plain Node ESM companion and a vanilla HTML/CSS/JS Studio, with local-only config and no accounts. The redesigned Studio shown here is an approved prototype, not the released app.',
    tags: ['Electron', 'Node.js (ESM)', 'discord-rpc', 'PowerShell', 'Vanilla JS', 'HTML/CSS'],
    coverImage: '/assets/project-covers/vibe-studio-cover-v1.webp',
    heroMedia: { image: '/assets/project-covers/vibe-studio-cover-v1.webp', kind: 'cover' },
    link: null,
    repo: null,
    code: `// Foreground changes pick the Scene: the most recently used paired app wins.
function pickScene(pairs, usage) {
  const used = pairs
    .filter((pair) => usage.has(pair.app))
    .sort((a, b) => usage.get(b.app) - usage.get(a.app));
  return used[0]?.scene ?? null;
}`,
    gallery: [
      {
        image: '/assets/vibe-studio/v1-switch.poster.png',
        video: '/assets/vibe-studio/v1-switch.mp4',
      },
      {
        image: '/assets/vibe-studio/v2-scene.poster.png',
        video: '/assets/vibe-studio/v2-scene.mp4',
      },
      {
        image: '/assets/vibe-studio/v3-pair.poster.png',
        video: '/assets/vibe-studio/v3-pair.mp4',
      },
    ],
    galleryLabels: ['Switch apps, status follows', 'Make a Scene', 'Pair apps to a Scene'],
    galleryDescriptions: [
      'VS Code is in front and the member row reads Coding; an Alt-Tab to Figma cross-fades the row and the profile card to Design, then back.',
      'A new Scene gets a name, two text lines and built-in art, and the Discord preview updates while you type, until the saved dialog appears.',
      'Photoshop and OBS are selected together and added to a Scene, then appear as chips under the apps that trigger it.',
    ],
    role: 'Product Designer & Director — built with AI agents under review',
  } satisfies ProjectRecord;
export default project;
