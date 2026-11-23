import urllib.request, json, time

test_points = [
    (-0.9525, -80.6905, "Av. 102 cerca a playa"),
    (-0.9545, -80.6875, "Av. 103 eje comercial"),
    (-0.9565, -80.6850, "Av. 105 centro Esteros"),
    (-0.9580, -80.6820, "Vía Puerto-Aeropuerto"),
    (-0.9550, -80.6930, "Sector La Florita"),
    (-0.9610, -80.6840, "Sector Los Almendros"),
]

for lat, lng, desc in test_points:
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'MantaLandCheck/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            name = data.get('display_name', 'ERR')
            road = data.get('address', {}).get('road', '')
            suburb = data.get('address', {}).get('suburb', '')
            print(f"{lat:.4f}, {lng:.4f} ({desc:22}) -> {road}, {suburb} | {name[:60]}")
    except Exception as e:
        print(desc, e)
    time.sleep(0.4)

