import urllib.request, json, time

coords = [
    ("manta", -0.9490, -80.7320),
    ("tarqui", -0.9530, -80.7050),
    ("los-esteros-CURRENT", -0.9450, -80.6850),
    ("los-esteros-PROPOSED", -0.9560, -80.6860),
    ("san-mateo", -0.9850, -80.8150),
    ("santa-marianita", -1.0300, -80.8450),
    ("san-lorenzo", -1.0650, -80.9100),
    ("eloy-alfaro", -0.9650, -80.6800),
]

for label, lat, lng in coords:
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'MantaCheck/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            name = data.get('display_name', 'UNKNOWN')
            print(f"{label:22} -> {name[:80]}")
    except Exception as e:
        print(label, e)
    time.sleep(0.5)

