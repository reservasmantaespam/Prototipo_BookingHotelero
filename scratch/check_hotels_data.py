import re

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Count hotels
hotel_matches = re.findall(r'\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",', content)
print(f"Total hotels found: {len(hotel_matches)}")

# Extract images
images = re.findall(r'"image":\s*"(https://images\.unsplash\.com/[^"]+)"', content)
print(f"Total image references: {len(images)}")
print(f"Unique images: {len(set(images))}")

# Check distances
distances = re.findall(r'"distance":\s*"([^"]+)"', content)
print(f"Total distance strings: {len(distances)}")
print("Sample distances:")
for d in distances[:5]:
    print(" -", d)

# Check coordinates
coords = re.findall(r'"lat":\s*([-\d.]+),\s*"lng":\s*([-\d.]+)', content)
print(f"Total coordinates: {len(coords)}")
lats = [float(c[0]) for c in coords]
lngs = [float(c[1]) for c in coords]
print(f"Lat: {min(lats):.4f} to {max(lats):.4f}")
print(f"Lng: {min(lngs):.4f} to {max(lngs):.4f}")
