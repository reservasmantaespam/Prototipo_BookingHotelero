import re

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('export const MANTA_HOTELS: Hotel[] =')
array_text = text[start_idx:]

# Parse hotel blocks
hotel_blocks = array_text.split('\n  {\n    "id":')
print(f"Parsed {len(hotel_blocks)-1} hotel blocks.")

parishes = {}
address_samples = []
coord_samples = []

for block in hotel_blocks[1:]:
    name_m = re.search(r'"name":\s*"([^"]+)"', block)
    name = name_m.group(1) if name_m else "Unknown"

    parish_m = re.search(r'"parroquia":\s*"([^"]+)"', block)
    parish = parish_m.group(1) if parish_m else "None"

    city_m = re.search(r'"city":\s*"([^"]+)"', block)
    city = city_m.group(1) if city_m else "None"

    addr_m = re.search(r'"address":\s*"([^"]+)"', block)
    addr = addr_m.group(1) if addr_m else "None"

    lat_m = re.search(r'"lat":\s*(-?[\d\.]+)', block)
    lat = float(lat_m.group(1)) if lat_m else 0

    lng_m = re.search(r'"lng":\s*(-?[\d\.]+)', block)
    lng = float(lng_m.group(1)) if lng_m else 0

    img_m = re.search(r'"image":\s*"([^"]+)"', block)
    img = img_m.group(1) if img_m else "None"

    parishes[parish] = parishes.get(parish, 0) + 1
    if len(address_samples) < 15:
        address_samples.append((name, parish, city, addr, lat, lng, img))

print("\nHotel count by Parroquia:")
for p, c in parishes.items():
    print(f"  - {p}: {c} hotels")

print("\nFirst 10 sample hotels:")
for s in address_samples[:10]:
    print(f"  - {s[0]} ({s[1]} | {s[2]}): {s[3]} => ({s[4]}, {s[5]})")
