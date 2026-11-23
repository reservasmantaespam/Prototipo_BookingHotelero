# Verify we can parse and update every single hotel in src/mantaHotels.ts
import re, json

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect all 116 hotel names and IDs
hotel_ids = re.findall(r'"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', content)
print(f"Found {len(hotel_ids)} hotels.")
for i, (hid, hname) in enumerate(hotel_ids[:10]):
    print(f"  {i+1}. [{hid}] {hname}")
