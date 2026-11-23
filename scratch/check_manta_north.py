import re, urllib.request, json, time

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"parroquia":\s*"([^"]+)"[\s\S]*?"lat":\s*([-0-9.]+)[\s\S]*?"lng":\s*([-0-9.]+)', re.MULTILINE)

matches = pattern.findall(text)
manta_northern = []
for hid, name, parr, lat, lng in matches:
    if parr.strip().upper() == "MANTA" and float(lat) > -0.9480:
        manta_northern.append((float(lat), float(lng), name))

print(f"Northern Manta hotels to verify: {len(manta_northern)}")
for lat, lng, name in manta_northern[:6]:
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'MantaCheck2/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"{name:30} ({lat:.4f}, {lng:.4f}) -> {data.get('display_name', '')[:65]}")
    except Exception as e:
        print(name, e)
    time.sleep(0.4)

