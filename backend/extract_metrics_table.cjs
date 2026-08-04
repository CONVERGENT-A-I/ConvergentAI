const fs = require('fs');
const readline = require('readline');

async function parseLogs() {
  const fileStream = fs.createReadStream('c:\\Users\\Sherry\\Documents\\Convergent_AI\\Logs2.md');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const turns = [];
  let currentTurn = {};

  for await (const line of rl) {
    if (line.includes('── TURN ')) {
      // [pipeline][10:55:40.186] ── TURN 6 SUMMARY ──  stt_done=?  llm_start=243ms  llm_first_token=569ms  llm_done=569ms  tts_start=521ms  tts_done=1440ms
      const turnMatch = line.match(/── TURN (\d+) SUMMARY ──/);
      if (turnMatch) {
        currentTurn.turnNumber = parseInt(turnMatch[1], 10);
        
        const llmStartMatch = line.match(/llm_start=(\d+)ms/);
        const llmFirstMatch = line.match(/llm_first_token=(\d+)ms/);
        
        if (llmStartMatch) currentTurn.stt_and_routing = parseInt(llmStartMatch[1], 10);
        if (llmStartMatch && llmFirstMatch) {
          currentTurn.llm_ttft = parseInt(llmFirstMatch[1], 10) - parseInt(llmStartMatch[1], 10);
        }
      }
    }
    
    if (line.includes('── AVATAR LATENCY ──')) {
      // [pipeline][10:55:40.892] ── AVATAR LATENCY ──  tts_to_avatar=760ms  tts_start_to_avatar=1624ms  e2e_user_to_avatar=2145ms
      const ttsToAvatarMatch = line.match(/tts_to_avatar=(-?\d+)ms/);
      const ttsStartToAvatarMatch = line.match(/tts_start_to_avatar=(-?\d+)ms/);
      const e2eMatch = line.match(/e2e_user_to_avatar=(-?\d+)ms/);
      
      if (ttsToAvatarMatch) currentTurn.tts_to_avatar = parseInt(ttsToAvatarMatch[1], 10);
      if (ttsStartToAvatarMatch) currentTurn.tts_start_to_avatar = parseInt(ttsStartToAvatarMatch[1], 10);
      if (e2eMatch) currentTurn.e2e = parseInt(e2eMatch[1], 10);
      
      if (currentTurn.tts_start_to_avatar !== undefined && currentTurn.tts_to_avatar !== undefined) {
        currentTurn.tts_ttfa = currentTurn.tts_start_to_avatar - currentTurn.tts_to_avatar;
      }
      
      // Compute bottleneck
      const metrics = [
        { name: 'STT & Routing', time: currentTurn.stt_and_routing || 0 },
        { name: 'LLM', time: currentTurn.llm_ttft || 0 },
        { name: 'TTS', time: currentTurn.tts_ttfa || 0 },
        { name: 'Avatar Render', time: currentTurn.tts_to_avatar || 0 }
      ];
      metrics.sort((a, b) => b.time - a.time);
      currentTurn.bottleneck = metrics[0].name;
      currentTurn.bottleneckTime = metrics[0].time;

      if (currentTurn.turnNumber) {
        turns.push(currentTurn);
      }
      currentTurn = {};
    }
  }

  // Print markdown table
  console.log('| Turn | STT & Routing (ms) | LLM TTFT (ms) | TTS TTFA (ms) | Avatar Render (ms) | E2E (ms) | Bottleneck |');
  console.log('|---|---|---|---|---|---|---|');
  for (const t of turns) {
    if (t.e2e === -1) continue; // skip turns with uncalculated e2e latency
    console.log(`| ${t.turnNumber} | ${t.stt_and_routing} | ${t.llm_ttft} | ${t.tts_ttfa} | ${t.tts_to_avatar} | ${t.e2e} | **${t.bottleneck}** (${t.bottleneckTime}ms) |`);
  }
}

parseLogs().catch(console.error);
