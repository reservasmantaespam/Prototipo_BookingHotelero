import re

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(
    r'\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"parroquia":\s*"([^"]+)"[\s\S]*?"address":\s*"([^"]+)"[\s\S]*?"tags":\s*\[([\s\S]*?)\][\s\S]*?"lat":\s*([-0-9.]+)[\s\S]*?"lng":\s*([-0-9.]+)',
    re.MULTILINE
)

hotels = pattern.findall(text)
print(f"Total parsed hotels: {len(hotels)}")

# Analyze "Frente al Mar" tag
frente_mar_hotels = []
for hid, name, parr, addr, tags, lat, lng in hotels:
    if "Frente al Mar" in tags:
        frente_mar_hotels.append((hid, name, parr, addr, float(lat), float(lng)))

print(f"\nHotels with 'Frente al Mar' tag: {len(frente_mar_hotels)}")
for hid, name, parr, addr, lat, lng in frente_mar_hotels:
    print(f"[{parr:15}] {name:32} | {addr:40} | lat: {lat:.4f}, lng: {lng:.4f}")

