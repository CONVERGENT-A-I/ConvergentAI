import 'dotenv/config';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = [
  'stage1-foundation.test.ts',
  'stage2-calculation-aus.test.ts',
  'stage3-prompts-findings.test.ts',
  'stage4-frontend-integration.test.ts',
  'stage5-audit-logging.test.ts',
  'stage6-prequal-letter.test.ts',
  'stage7-e2e-flow.test.ts',
  'stage8-v87-features.test.ts',
  'refinance-flow.test.ts',
  'heloc-flow.test.ts',
];

console.log('🚀 Running Complete ConvergentAI Multi-Track Test Suite...\n');

let allPassed = true;

for (const file of testFiles) {
  const filePath = path.join(__dirname, file);
  try {
    execSync(`npx tsx "${filePath}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Test Suite ${file} failed.`);
    allPassed = false;
    process.exit(1);
  }
}

if (allPassed) {
  console.log('\n======================================================');
  console.log('✨ ALL 10 CONVERGENTAI UNIT & INTEGRATION TEST SUITES PASSED!');
  console.log('======================================================\n');
}
