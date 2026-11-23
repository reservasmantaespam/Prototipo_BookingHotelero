import re, urllib.request, json, time

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(
    r'\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"parroquia":\s*"([^"]+)"[\s\S]*?"address":\s*"([^"]+)"[\s\S]*?"lat":\s*([-0-9.]+)[\s\S]*?"lng":\s*([-0-9.]+)',
    re.MULTILINE
)

hotels = pattern.findall(text)
print(f"Loaded {len(hotels)} hotels from src/mantaHotels.ts")

# Check each hotel via Nominatim reverse geocode
in_water = []
on_land = []

for idx, (hid, name, parr, addr, lat_str, lng_str) in enumerate(hotels, 1):
    lat = float(lat_str)
    lng = float(lng_str)
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'MantaLandChecker/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            display = data.get('display_name', '')
            # If display is empty or doesn't have road/suburb/city, or snaps very far away (>0.005 deg)
            snap_lat = float(data.get('lat', lat))
            snap_lon = float(data.get('lon', lng))
            dist_deg = ((snap_lat - lat)**2 + (snap_lon - lng)**2)**0.5
            
            # If distance to snapped land feature is > 0.002 deg (~220m), it's likely in the water
            if dist_deg > 0.0025:
                in_water.append((hid, name, parr, addr, lat, lng, snap_lat, snap_lon, dist_deg, display[:50]))
                print(f"⚠️ [{idx}] IN WATER?: {name} ({parr}) at {lat:.5f},{lng:.5f} (snapped to {snap_lat:.5f},{snap_lon:.5f}, dist={dist_deg*111:.1f}km) -> {display[:40]}")
            else:
                on_land.append((hid, name, parr, lat, lng))
    except Exception as e:
        print(f"Err on {name}: {e}")
    time.sleep(0.35)

print(f"\nSummary: {len(on_land)} on land, {len(in_water)} potentially in water.")

