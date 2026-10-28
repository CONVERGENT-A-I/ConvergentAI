const fs = require('fs');
const path = require('path');

const defaultInput = fs.existsSync(path.join(__dirname, '../Logs.md'))
    ? path.join(__dirname, '../Logs.md')
    : path.join(__dirname, '../Logs2.md');

const inputFile = process.argv[2] ? path.resolve(process.argv[2]) : defaultInput;
const outputFile = process.argv[3] ? path.resolve(process.argv[3]) : path.join(__dirname, '../Logs2_parsed.txt');

console.log(`Reading ${inputFile}...`);
let data = fs.readFileSync(inputFile, 'utf8');

try {
    const logs = JSON.parse(data);
    console.log(`Parsed ${logs.length} entries from ${path.basename(inputFile)}`);

    let existingLines = new Set();
    if (fs.existsSync(outputFile)) {
        const existingContent = fs.readFileSync(outputFile, 'utf8');
        existingContent.split(/\r?\n/).forEach(line => {
            if (line.trim()) existingLines.add(line.trim());
        });
        console.log(`Found ${existingLines.size} unique lines in ${path.basename(outputFile)}`);
    }

    let newContent = '';
    let added = 0;

    logs.forEach(log => {
        let payload = undefined;
        if (log.textPayload !== undefined && log.textPayload !== null) {
            payload = log.textPayload;
        } else if (log.jsonPayload !== undefined && log.jsonPayload !== null) {
            payload = JSON.stringify(log.jsonPayload);
        }

        if (log.timestamp && payload !== undefined) {
            const normalizedPayload = String(payload).replace(/\r?\n/g, '\r\n');
            const line = `[${log.timestamp}] ${normalizedPayload}`;
            const firstLineKey = `[${log.timestamp}] ${normalizedPayload.split('\r\n')[0]}`.trim();
            if (!existingLines.has(firstLineKey)) {
                newContent += line + '\r\n';
                existingLines.add(firstLineKey);
                added++;
            }
        }
    });

    if (added > 0) {
        fs.appendFileSync(outputFile, newContent);
        console.log(`Added ${added} new log entries to ${path.basename(outputFile)}.`);
    } else {
        console.log(`No new log entries to add.`);
    }
} catch (e) {
    console.error('Failed to parse JSON. Might be malformed:', e.message);
}

