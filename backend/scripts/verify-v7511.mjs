import { readFileSync } from 'node:fs';

const dockerfile = readFileSync(new URL('../../backend.Dockerfile', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(
  dockerfile.includes('COPY backend.Dockerfile frontend.Dockerfile ./'),
  'Backend Docker builder must include Dockerfiles required by regression checks',
);

console.log('v7.5.11 backend Docker test-fixture verification passed.');
