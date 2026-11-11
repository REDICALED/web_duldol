import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { UUID_PATTERN, MEDIA_KEY_PATTERN, hashBytes } from './migration-lib.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const args = process.argv.slice(2);
const option = name => {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a value`);
  return args[index + 1];
};
for (let i = 0; i < args.length; i++) {
  if (!['--manifest', '--bucket', '--execute', '--remote', '--help'].includes(args[i])) throw new Error(`Unknown argument: ${args[i]}`);
  if (args[i] === '--manifest' || args[i] === '--bucket') i++;
}
if (args.includes('--help')) {
  console.log('node scripts/upload-migration-assets.mjs --bucket NAME [--manifest .migration/assets.json] [--execute [--remote]]');
  console.log('Default: verifies and prints a local upload plan. --execute writes to local Wrangler R2; --execute --remote writes to Cloudflare.');
  process.exit(0);
}
if (args.includes('--remote') && !args.includes('--execute')) throw new Error('--remote requires --execute');
const bucket = option('--bucket');
if (!bucket || !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error('--bucket requires an R2 bucket name');
const manifestPath = path.resolve(root, option('--manifest') || '.migration/assets.json');
const manifestDirectory = path.dirname(manifestPath);
if (!manifestPath.startsWith(root + path.sep)) throw new Error('Manifest must be inside this repository');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!Array.isArray(manifest.assets)) throw new Error('Manifest must contain an assets array');
const execute = args.includes('--execute');
const remote = args.includes('--remote');
const verified = [];

// Verify the entire set before any write. Paths and keys cannot escape the migration directory.
for (const asset of manifest.assets) {
  if (!UUID_PATTERN.test(asset.id) || !MEDIA_KEY_PATTERN.test(asset.object_key)
    || !asset.object_key.startsWith(`images/${asset.id}.`)) throw new Error(`Unexpected image identity: ${asset.object_key}`);
  const filename = path.resolve(manifestDirectory, asset.local_file);
  if (!filename.startsWith(manifestDirectory + path.sep)) throw new Error('Asset file escapes migration directory');
  if ((await stat(filename)).size !== asset.size || hashBytes(await readFile(filename)) !== asset.sha256) {
    throw new Error(`Asset integrity check failed: ${asset.object_key}`);
  }
  verified.push({ ...asset, filename });
}

const candidates = [
  path.join(root, 'cloudflare', 'node_modules', 'wrangler', 'bin', 'wrangler.js'),
  path.join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js'),
];
let wrangler;
if (execute) {
  for (const candidate of candidates) {
    try { await stat(candidate); wrangler = candidate; break; } catch { /* Try the next installed package. */ }
  }
  if (!wrangler) throw new Error('Wrangler is not installed. Run npm --prefix cloudflare install first.');
}
for (const asset of verified) {
  const command = [wrangler, 'r2', 'object', 'put', `${bucket}/${asset.object_key}`,
    '--file', asset.filename, '--content-type', asset.mime_type, remote ? '--remote' : '--local',
    '--config', path.join(root, 'cloudflare', 'wrangler.jsonc')];
  if (!remote) command.push('--env', 'local');
  if (!execute) {
    console.log(JSON.stringify({ object: `${bucket}/${asset.object_key}`, file: path.relative(root, asset.filename), content_type: asset.mime_type, bytes: asset.size }));
    continue;
  }
  const result = spawnSync(process.execPath, command, { cwd: root, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Upload failed for ${asset.object_key}; keep media-identities.json and rerun to retry the same objects.`);
}
console.log(`${execute ? 'Uploaded' : 'Verified plan for'} ${verified.length} objects (${verified.reduce((sum, asset) => sum + asset.size, 0)} bytes). Target: ${execute ? remote ? 'REMOTE R2' : 'local Wrangler R2' : 'none; dry-run'}.`);
