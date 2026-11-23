import json

transcript_path = r'C:\Users\leneker\.gemini\antigravity\brain\73380109-92d8-4d42-bec6-1d9e7c113a3d\.system_generated\logs\transcript.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    lines = [json.loads(line) for line in f]

user_steps = [item for item in lines if item.get('source') == 'USER_EXPLICIT' or item.get('type') == 'USER_INPUT']
print(f"Total user steps: {len(user_steps)}")
for item in user_steps[-5:]:
    step = item.get('step_index')
    media = [m.get('uri') for m in item.get('media', [])]
    cnt = str(item.get('content', ''))
    print(f"Step {step} | media: {media} | content: {cnt}")
