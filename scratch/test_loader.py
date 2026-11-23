import json
import re

# Load all 116 hotels from mantaHotels.ts
with open("src/mantaHotels.ts", "r", encoding="utf-8") as f:
    ts_code = f.read()

match = re.search(r'export const MANTA_HOTELS: Hotel\[\] = (\[[\s\S]*?\n\];)', ts_code)
if not match:
    print("Error finding MANTA_HOTELS")
    exit(1)

# Write a node script to generate the updated hotels array with 100% verified coordinates and tags
print("Found MANTA_HOTELS, size:", len(match.group(1)))

