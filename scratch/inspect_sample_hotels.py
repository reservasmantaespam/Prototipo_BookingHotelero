import json

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's extract MANTA_HOTELS
import re

# Find all hotel blocks
raw_blocks = re.split(r'\n  \{', text)[1:]
print(f"Total blocks in mantaHotels: {len(raw_blocks)}")

for i, b in enumerate(raw_blocks[:15]):
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    parr_m = re.search(r'"parroquia":\s*"([^"]+)"', b)
    addr_m = re.search(r'"address":\s*"([^"]+)"', b)
    lat_m = re.search(r'"lat":\s*([-0-9.]+)', b)
    lng_m = re.search(r'"lng":\s*([-0-9.]+)', b)
    tags_m = re.search(r'"tags":\s*\[([\s\S]*?)\]', b)

    name = name_m.group(1) if name_m else '?'
    parr = parr_m.group(1) if parr_m else '?'
    addr = addr_m.group(1) if addr_m else '?'
    lat = lat_m.group(1) if lat_m else '?'
    lng = lng_m.group(1) if lng_m else '?'
    tags = [t.strip().strip('"') for t in tags_m.group(1).split(',')] if tags_m else []
    frente_mar = "Frente al Mar" in tags
    print(f"[{i+1:2}] {name:30} | {parr:15} | FrenteMar: {str(frente_mar):5} | lat: {lat:10} | lng: {lng:10} | addr: {addr}")

