// Local, explicit bootstrap; never writes to the owner's checkout or commits files.
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const options = {};
for (let i = 2; i < process.argv.length; i++) {
  const key = process.argv[i];
  if (['--freeze', '--install', '--check'].includes(key)) options[key] = true;
  else if (['--bundle', '--target'].includes(key) && process.argv[i + 1]) options[key] = process.argv[++i];
  else throw new Error(`Unknown or incomplete argument: ${key}`);
}
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const files = [
  'DESIGN.md', 'docs/design/2026-10-01-taste-ledger.md',
  ...['PAGES.md', 'README.md', 'COORDINATOR-PROMPT.md', 'AUTOMATION-PROMPT.md', 'prepare.mjs', 'shoot.cjs']
    .map((name) => `docs/design/loop/${name}`),
];

if (options['--freeze']) {
  if (options['--target'] || options['--check'] || options['--install']) throw new Error('Freeze cannot apply or install.');
  const bundle = path.resolve(options['--bundle'] || path.join(root, 'tmp/design-loop-seed', new Date().toISOString().replace(/[:.]/g, '-')));
  if (fs.existsSync(bundle)) throw new Error('Bundle already exists; use a new path.');
  const contents = files.map((file) => ({ file, bytes: fs.readFileSync(path.join(root, file)) }));
  const manifest = { sourceRoot: root, base: git(root, 'rev-parse', 'develop'), createdAt: new Date().toISOString(), files: {} };
  for (const { file, bytes } of contents) {
    const destination = path.join(bundle, 'files', file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, bytes);
    manifest.files[file] = sha(bytes);
  }
  fs.writeFileSync(path.join(bundle, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ bundle, base: manifest.base, files: contents.length }));
} else {
  if (!options['--bundle'] || !options['--target']) throw new Error('Use --freeze or --bundle <dir> --target <worktree> [--install|--check].');
  const bundle = fs.realpathSync(options['--bundle']);
  const target = fs.realpathSync(options['--target']);
  const manifest = JSON.parse(fs.readFileSync(path.join(bundle, 'manifest.json'), 'utf8'));
  if (target.toLowerCase() === fs.realpathSync(manifest.sourceRoot).toLowerCase()) throw new Error('Refusing to bootstrap the owner checkout.');
  if (path.resolve(git(target, 'rev-parse', '--show-toplevel')).toLowerCase() !== target.toLowerCase()) throw new Error('Target must be a worktree root.');
  const common = (cwd) => fs.realpathSync(path.resolve(cwd, git(cwd, 'rev-parse', '--git-common-dir'))).toLowerCase();
  if (common(target) !== common(manifest.sourceRoot)) throw new Error('Target belongs to another repository.');
  git(target, 'merge-base', '--is-ancestor', manifest.base, 'HEAD');
  const entries = Object.entries(manifest.files);
  if (entries.length !== files.length || entries.some(([file]) => !files.includes(file))) throw new Error('Unexpected bundle file list.');
  const contents = entries.map(([file, hash]) => {
    const bytes = fs.readFileSync(path.join(bundle, 'files', file));
    if (sha(bytes) !== hash) throw new Error(`Bundle integrity failed: ${file}`);
    return { file, bytes, hash };
  });
  if (!options['--check']) {
    if (git(target, 'status', '--porcelain')) throw new Error('Target must be clean before bootstrap; preserve existing work.');
    for (const { file, bytes } of contents) {
      const destination = path.join(target, file);
      // Never follow an existing symlink/junction outside the target.
      let parent = path.dirname(destination);
      while (!fs.existsSync(parent)) parent = path.dirname(parent);
      const relative = path.relative(target, fs.realpathSync(parent));
      if (relative.startsWith('..') || path.isAbsolute(relative) || (fs.existsSync(destination) && fs.lstatSync(destination).isSymbolicLink())) throw new Error(`Unsafe destination: ${file}`);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, bytes);
    }
    if (options['--install']) {
      const npmCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
      if (process.platform === 'win32' && !fs.existsSync(npmCli)) throw new Error('npm CLI not found beside Node; run npm ci manually, then --check.');
      const result = process.platform === 'win32'
        ? spawnSync(process.execPath, [npmCli, 'ci'], { cwd: target, stdio: 'inherit' })
        : spawnSync('npm', ['ci'], { cwd: target, stdio: 'inherit' });
      if (result.error || result.status !== 0) throw new Error('npm ci failed; do not start workers.');
    }
  }
  for (const { file, hash } of contents) if (sha(fs.readFileSync(path.join(target, file))) !== hash) throw new Error(`Target differs from seed: ${file}`);
  const require = createRequire(path.join(target, 'package.json'));
  const { chromium } = require('playwright');
  if (!fs.existsSync(chromium.executablePath())) throw new Error('Playwright Chromium missing: run npx playwright install chromium in the target.');
  console.log(JSON.stringify({ target, base: manifest.base, seedVerified: true, playwright: require('playwright/package.json').version, chromium: 'installed' }));
}
