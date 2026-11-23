import re

with open('src/MantaMapModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect MANTA_OFFICIAL_SECTORS
print("--- PARISH SECTORS ---")
m = re.findall(r'id:\s*"([^"]+)",\s*name:\s*"([^"]+)"[\s\S]*?lat:\s*([-0-9.]+),\s*lng:\s*([-0-9.]+)', text)
for pid, name, lat, lng in m:
    print(f"{pid:18} | {name:20} | lat: {lat:8} | lng: {lng:8}")

