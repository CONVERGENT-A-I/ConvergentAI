import { readFileSync } from 'node:fs';

const rootPackage = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const backendPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const backendDockerfile = readFileSync(new URL('../../backend.Dockerfile', import.meta.url), 'utf8');
const agent = readFileSync(new URL('../src/agent.ts', import.meta.url), 'utf8');
const context = readFileSync(new URL('../src/context/session-context-manager.ts', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(rootPackage.version === '7.5.20', 'Root release version is not current');
assert(backendPackage.version === '7.5.20', 'Backend release version is not current');
assert(backendDockerfile.includes('COPY package.json package-lock.json ./'), 'Backend Docker builder must include root manifests');
assert(!backendDockerfile.includes('COPY node_modules ./node_modules'), 'Backend Dockerfile must not copy root node_modules');
assert(agent.includes('BUILD_VERSION=v7.5.20-dev-feature-integration'), 'Runtime build version diagnostic is stale');
assert(context.includes('late result ignored for realtime state'), 'Late extraction results are not terminal after timeout');

console.log('v7.5.12 production-hardening verification passed.');
