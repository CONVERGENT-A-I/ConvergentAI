import json
import sys

log_file = "C:/Users/Sherry/Documents/Convergent_AI/Logs2.md"

try:
    with open(log_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
except Exception as e:
    print(f"Error loading JSON: {e}")
    sys.exit(1)

with open('extract_dialog_output.txt', 'w', encoding='utf-8') as out:
    for log in data:
        payload = log.get("textPayload", "")
        if "STT final transcript" in payload or "[agent]" in payload or "[avatar]" in payload or "[pipeline]" in payload:
            if "Task.runTask" in payload or "input stream" in payload or "inference-tts" in payload or "prisma:query" in payload:
                continue
            out.write(payload + '\n')
