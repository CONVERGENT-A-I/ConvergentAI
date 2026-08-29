import json
import os

input_file = r'c:\Users\Sherry\Documents\Convergent_AI\Logs2.md'
output_file = r'c:\Users\Sherry\Documents\Convergent_AI\Logs2_parsed.txt'

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    with open(output_file, 'w', encoding='utf-8') as out:
        for entry in data:
            timestamp = entry.get('timestamp', '')
            text = entry.get('textPayload', '')
            if timestamp and text:
                out.write(f"[{timestamp}] {text}\n")
            elif text:
                out.write(f"{text}\n")
    print(f"Successfully parsed {len(data)} logs to {output_file}")
except Exception as e:
    print(f"Error: {e}")
