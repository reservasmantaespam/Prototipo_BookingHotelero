import re

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('export const MANTA_HOTELS: Hotel[] =')
array_text = text[start_idx:]
hotel_blocks = array_text.split('\n  {\n    "id":')

coords = set()
duplicates = []
out_of_bounds = []

for block in hotel_blocks[1:]:
    name_m = re.search(r'"name":\s*"([^"]+)"', block)
    name = name_m.group(1) if name_m else "Unknown"
    lat_m = re.search(r'"lat":\s*(-?[\d\.]+)', block)
    lng_m = re.search(r'"lng":\s*(-?[\d\.]+)', block)
    if lat_m and lng_m:
        lat = round(float(lat_m.group(1)), 5)
        lng = round(float(lng_m.group(1)), 5)
        key = (lat, lng)
        if key in coords:
            duplicates.append((name, key))
        coords.add(key)
        
        # Manta bounding box check
        # Latitude roughly -1.10 to -0.93
        # Longitude roughly -80.95 to -80.60
        if not (-1.15 <= lat <= -0.90 and -80.95 <= lng <= -80.60):
            out_of_bounds.append((name, lat, lng))

print(f"Total unique coordinates: {len(coords)}")
print(f"Duplicates: {len(duplicates)}")
for d in duplicates[:5]:
    print("  Duplicate:", d)
print(f"Out of bounds: {len(out_of_bounds)}")
