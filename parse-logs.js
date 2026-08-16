const fs = require('fs');
const data = JSON.parse(fs.readFileSync('Logs2.md', 'utf8'));

// Regex to strip ANSI escape codes
const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');

const out = data.map(log => {
    const time = new Date(log.timestamp).toISOString();
    const severity = log.severity || 'INFO';
    const text = stripAnsi(log.textPayload || '');
    return `[${time}] [${severity}] ${text}`;
}).join('\n');

fs.writeFileSync('Logs2_parsed.txt', out);
console.log('Parsed successfully with ANSI stripped, lines:', data.length);
