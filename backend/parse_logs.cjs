const fs = require('fs');
const readline = require('readline');

async function parseLogs() {
  const fileStream = fs.createReadStream('c:\\Users\\Sherry\\Documents\\Convergent_AI\\Logs2.md');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const turns = [];
  let currentTurn = null;

  const latencies = [];
  const pipelineSummaries = [];

  let transcript = [];
  
  for await (const line of rl) {
    if (line.includes('user_transcript:')) {
      const match = line.match(/user_transcript:\s*"(.*)"/);
      if (match) {
        transcript.push(`USER: ${match[1]}`);
      }
    }
    if (line.includes('playout completed without interruption') || line.includes('message: "')) {
       // Need to be careful, sometimes 'message: "' is on the next line
    }
    
    // Better way to capture transcript:
    // User says: 'user_transcript: "..."'
    // Agent says: 'message: "..."' right after 'playout completed' or similar.
    const agentMatch = line.match(/message:\s*"(.*)"/);
    if (agentMatch && !line.includes('agent-debug')) {
       transcript.push(`AILANA: ${agentMatch[1]}`);
    }

    if (line.includes('"type":"ailana-metrics"')) {
      try {
        const parsed = JSON.parse(line.trim());
        if (parsed.event === 'turn' && parsed.e2eLatencyMs !== undefined) {
          latencies.push({ turn: parsed.turnNumber, e2e: parsed.e2eLatencyMs });
        }
      } catch (e) {}
    }
    
    if (line.includes('── TURN ') && line.includes('SUMMARY')) {
      pipelineSummaries.push(line.trim());
    }
  }

  console.log("=== TRANSCRIPT ===");
  console.log(transcript.join("\n"));
  
  console.log("\n=== E2E LATENCIES ===");
  console.log(JSON.stringify(latencies, null, 2));
  
  console.log("\n=== PIPELINE SUMMARIES ===");
  for (const sum of pipelineSummaries) {
    console.log(sum);
  }
}

parseLogs().catch(console.error);
