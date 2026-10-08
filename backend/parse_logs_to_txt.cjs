const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../Logs2.md');
const outputFile = path.join(__dirname, '../Logs2_parsed.txt');

console.log('Reading Logs2.md...');
let data = fs.readFileSync(inputFile, 'utf8');

// The file might have multiple JSON arrays appended or a trailing comma?
// Let's assume it's a valid JSON array or we fix it.
try {
    const logs = JSON.parse(data);
    console.log(`Parsed ${logs.length} entries from Logs2.md`);

    let existingLines = new Set();
    if (fs.existsSync(outputFile)) {
        const existingContent = fs.readFileSync(outputFile, 'utf8');
        existingContent.split('\n').forEach(line => {
            if (line.trim()) existingLines.add(line.trim());
        });
        console.log(`Found ${existingLines.size} existing lines in Logs2_parsed.txt`);
    }

    let newContent = '';
    let added = 0;

    logs.forEach(log => {
        if (log.timestamp && log.textPayload) {
            const line = `[${log.timestamp}] ${log.textPayload}`;
            if (!existingLines.has(line.trim())) {
                newContent += line + '\n';
                added++;
            }
        }
    });

    if (added > 0) {
        fs.appendFileSync(outputFile, newContent);
        console.log(`Added ${added} new log entries.`);
    } else {
        console.log(`No new log entries to add.`);
    }
} catch (e) {
    console.error('Failed to parse JSON. Might be malformed:', e.message);
    // Try a regex based fallback if JSON is broken
}
