const fs = require('fs');
const lines = fs.readFileSync('c:\\Users\\Sherry\\Documents\\Convergent_AI\\Logs2_parsed.txt', 'utf8').split('\n');

let turns = [];
let currentTurn = null;

const logRegex = /^\[(.*?)\] \[(.*?)\] (.*)/;

lines.forEach(line => {
    const match = line.match(logRegex);
    if (!match) return;
    const [_, time, level, msg] = match;
    
    // Detect turn start
    if (msg.includes('user_transcript:')) {
        currentTurn = {
            id: turns.length + 1,
            time: time,
            userText: msg.split('user_transcript:')[1]?.trim(),
            metrics: [],
            reconcile: [],
            warnings: [],
            agentText: ''
        };
        turns.push(currentTurn);
    } else if (msg.includes('STT final transcript:')) {
        if (!currentTurn) {
            currentTurn = {
                id: turns.length + 1,
                time: time,
                userText: msg.split('STT final transcript:')[1]?.trim(),
                metrics: [],
                reconcile: [],
                warnings: [],
                agentText: ''
            };
            turns.push(currentTurn);
        } else if (!currentTurn.userText) {
            currentTurn.userText = msg.split('STT final transcript:')[1]?.trim();
        }
    } else if (msg.includes('Agent replied:') || msg.includes('Agent response:')) {
        // Some logs might not have recognized text but do have agent response.
        // If there's no current turn, let's just create a dummy one for now, or append to current.
        if (!currentTurn) {
             currentTurn = { id: turns.length + 1, time: time, userText: '', metrics: [], reconcile: [], warnings: [], agentText: msg };
             turns.push(currentTurn);
        } else {
             currentTurn.agentText = msg;
        }
    }
    
    if (currentTurn) {
        if (msg.includes('TTFT=') || msg.includes('LLM stream complete') || msg.includes('LLM metrics') || msg.includes('E2E') || msg.includes('TTFB') || msg.includes('Audio started') || msg.includes('Avatar')) {
            if (msg.includes('TTFT=') || msg.includes('LLM metrics') || msg.includes('E2E') || msg.includes('TTFB=') || msg.includes('Audio Delay')) {
                currentTurn.metrics.push(msg);
            }
        }
        if (msg.includes('[reconcile]')) {
            currentTurn.reconcile.push(msg);
        }
        if (msg.includes('Stage boundary') || msg.includes('pendingField')) {
            currentTurn.reconcile.push(msg);
        }
        if (level.includes('WARN') || level.includes('ERROR') || msg.includes('fallback') || msg.includes('optimistic rollback') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error')) {
            if (!msg.includes('AgentActivity.pipelineReply')) {
                currentTurn.warnings.push(msg);
            }
        }
    }
});

const summary = turns.map(t => {
    return `\n--- Turn ${t.id} ---\nTime: ${t.time}\nUser: ${t.userText}\nMetrics:\n  ${t.metrics.join('\n  ')}\nReconcile & State:\n  ${t.reconcile.join('\n  ')}\nWarnings/Errors:\n  ${t.warnings.join('\n  ')}\n`;
}).join('\n');

fs.writeFileSync('c:\\Users\\Sherry\\Documents\\Convergent_AI\\analysis_summary.txt', summary);
console.log(`Analyzed ${turns.length} turns.`);
