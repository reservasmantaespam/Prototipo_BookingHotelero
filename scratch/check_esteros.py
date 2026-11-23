import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"parroquia":\s*"([^"]+)"[\s\S]*?"lat":\s*([-0-9.]+)[\s\S]*?"lng":\s*([-0-9.]+)', re.MULTILINE)

matches = pattern.findall(text)
print(f"Total matched hotels: {len(matches)}")
for hid, name, parr, lat, lng in matches:
    if "estero" in parr.lower():
        print(f"{name:35} | {parr} | lat: {lat}, lng: {lng}")

