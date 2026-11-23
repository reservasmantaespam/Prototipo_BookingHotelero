import re

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"parroquia":\s*"([^"]+)"[\s\S]*?"lat":\s*([-0-9.]+)[\s\S]*?"lng":\s*([-0-9.]+)', re.MULTILINE)

matches = pattern.findall(text)
print("Checking each parroquia bounds:")
parrs = {}
for hid, name, parr, lat, lng in matches:
    p = parr.strip().upper()
    if p not in parrs:
        parrs[p] = []
    parrs[p].append((float(lat), float(lng), name))

for p, items in parrs.items():
    lats = [x[0] for x in items]
    lngs = [x[1] for x in items]
    print(f"{p:18} ({len(items)} hotels): lat [{min(lats):.4f} to {max(lats):.4f}], lng [{min(lngs):.4f} to {max(lngs):.4f}]")

