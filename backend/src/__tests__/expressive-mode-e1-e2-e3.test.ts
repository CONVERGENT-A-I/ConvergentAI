import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildVoiceInstructions } from '../prompts/ailana-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runExpressiveVerification() {
  console.log('🧪 Running Verification Tests for Steps E1, E2, and E3...\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ Passed [${testName}]`);
      passedTests++;
    } else {
      console.error(`❌ FAILED [${testName}]: ${details || ''}`);
      process.exitCode = 1;
    }
  }

  const agentPath = path.resolve(__dirname, '../agent.ts');
  const ailanaSystemPath = path.resolve(__dirname, '../prompts/ailana-system.ts');

  const agentCode = fs.readFileSync(agentPath, 'utf8');
  const systemPromptCode = fs.readFileSync(ailanaSystemPath, 'utf8');

  // ==========================================
  // STEP E1 TESTS: speechSteering in agent.ts
  // ==========================================
  console.log('--- Step E1 Verification: Framework-level speechSteering ---');

  // E1.1: speechSteering object existence in expressiveConfig
  const hasSpeechSteering = agentCode.includes('speechSteering: {');
  assert(hasSpeechSteering, 'E1.1 - speechSteering defined in expressiveConfig');

  // E1.2: disfluencies explicitly false
  const disfluenciesFalse = /disfluencies:\s*false/.test(agentCode);
  assert(disfluenciesFalse, 'E1.2 - speechSteering.disfluencies is false (removes um/uh injection)');

  // E1.3: nonverbalSounds explicitly false
  const nonverbalSoundsFalse = /nonverbalSounds:\s*false/.test(agentCode);
  assert(nonverbalSoundsFalse, 'E1.3 - speechSteering.nonverbalSounds is false (filters non-verbal markup)');

  // E1.4: Expressive mode enabled conditional mapping
  const expressiveConfigAttached = agentCode.includes('expressive: expressiveConfig,');
  assert(expressiveConfigAttached, 'E1.4 - expressiveConfig passed into AgentSession options');

  // ==========================================
  // STEP E2 TESTS: Emotion & Prosody Constraints
  // ==========================================
  console.log('\n--- Step E2 Verification: Emotion, Prosody & Pause Constraints ---');

  // E2.1: ttsInstructionsAppend includes emotion constraints
  assert(agentCode.includes('EMOTION CONSTRAINTS:'), 'E2.1 - EMOTION CONSTRAINTS section present');
  assert(agentCode.includes('Strongly prefer these expression labels: neutral, calm, content, peaceful, serene, grateful, affectionate, sympathetic, confident, contemplative.'), 'E2.2 - Preferred expression labels present');
  assert(agentCode.includes('Avoid high-energy expression labels: excited, amazed, surprised, angry, panicked, triumphant, elated, scared.'), 'E2.3 - High-energy emotion avoidance present');
  assert(agentCode.includes('NEVER use unprofessional or incongruent expression labels: flirtatious, sarcastic, ironic, disgusted, or joking/comedic.'), 'E2.4 - Unprofessional expression ban present');

  // E2.5: Prosody constraints
  assert(agentCode.includes('PROSODY CONSTRAINTS:'), 'E2.5 - PROSODY CONSTRAINTS section present');
  assert(agentCode.includes('Do NOT use the "fast" or "loud" prosody markers. Only "slow" is permitted for reading back numbers, dates, or codes.'), 'E2.6 - Fast/loud prohibition and slow restriction present');

  // E2.7: Pause constraints
  assert(agentCode.includes('PAUSE CONSTRAINTS:'), 'E2.7 - PAUSE CONSTRAINTS section present');
  assert(agentCode.includes('Keep break durations brief (250ms to 500ms, e.g. <expr type="break" label="300ms"/>). Never exceed 1s to prevent avatar visual freezing.'), 'E2.8 - Break duration limits defined (250ms-500ms, max 1s)');

  // E2.9: ttsInstructionsTemplate safety (not overridden without placeholder)
  const dangerouslyOverridesTemplate = agentCode.includes('ttsInstructionsTemplate:') && !agentCode.includes('{tts.markup.llm_instructions}');
  assert(!dangerouslyOverridesTemplate, 'E2.9 - ttsInstructionsTemplate is not improperly overridden (preserves LiveKit expr lowering)');

  // ==========================================
  // STEP E3 TESTS: Opening Clause Pacing & Expression Dialect
  // ==========================================
  console.log('\n--- Step E3 Verification: Voice Pacing & Cartesia Dialect ---');

  // E3.1: Opening clause pacing in ailana-system.ts
  assert(systemPromptCode.includes('OPENING CLAUSE PACING:'), 'E3.1 - OPENING CLAUSE PACING rule present in source');
  assert(systemPromptCode.includes('Always begin responses with a short, complete opening sentence of 6 to 12 words ending with a PERIOD before elaborating'), 'E3.2 - 6 to 12 words with PERIOD rule specified');
  assert(systemPromptCode.includes('Never join the opening beat with a comma, as synthesis requires a terminal sentence delimiter (period) to begin streaming immediately'), 'E3.3 - Comma ban explaining streaming synthesis chunk flush present');

  // E3.4: 'amused' replaced with 'content' in AVATAR EXPRESSION GUIDANCE
  const hasAmusedInSystem = /Use 'amused'/.test(systemPromptCode);
  const hasContentInSystem = /Use 'content' or 'curious'/.test(systemPromptCode);
  assert(!hasAmusedInSystem, 'E3.4 - Deprecated "amused" expression removed (incompatible with Cartesia Sonic-3.6)');
  assert(hasContentInSystem, 'E3.5 - Compliant "content" expression present in avatar guidance');

  // E3.6: Runtime prompt assembly includes the rules
  const runtimeVoicePrompt = buildVoiceInstructions();
  assert(runtimeVoicePrompt.includes('OPENING CLAUSE PACING:'), 'E3.6 - Runtime buildVoiceInstructions() includes OPENING CLAUSE PACING');
  assert(runtimeVoicePrompt.includes('Use \'content\' or \'curious\''), 'E3.7 - Runtime buildVoiceInstructions() includes content/curious');

  console.log(`\n==========================================`);
  console.log(`Summary: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL STEP E1, E2, AND E3 VERIFICATION TESTS PASSED 100%!');
  } else {
    console.error('❌ SOME TESTS FAILED');
  }
}

runExpressiveVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
