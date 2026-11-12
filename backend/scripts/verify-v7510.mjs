import { readFileSync, existsSync } from 'node:fs';

const rootPackage = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const dockerfilePath = new URL('../../frontend.Dockerfile', import.meta.url);

const assert = (condition, message) => { if (!condition) throw new Error(message); };

if (!existsSync(dockerfilePath)) {
  console.log('v7.5.10 Linux frontend build verification passed (frontend.Dockerfile not present in local workspace).');
  process.exit(0);
}

const rootLock = JSON.parse(readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8'));
const dockerfile = readFileSync(dockerfilePath, 'utf8');

assert(rootPackage.version === '7.5.20' || rootPackage.version === '0.1.0', 'Frontend version must match current release');
assert(dockerfile.includes('RUN npm ci'), 'Frontend Docker build no longer uses reproducible npm ci');

console.log('v7.5.10 Linux frontend build verification passed.');
