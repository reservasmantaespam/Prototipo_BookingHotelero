import urllib.request, urllib.parse, json

queries = [
    'Playa Los Esteros, Manta',
    'Los Esteros, Manta, Ecuador',
    'Aeropuerto Internacional Eloy Alfaro, Manta',
    'Av. 103, Manta',
    'Calle 118, Manta'
]

for q in queries:
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(q)}&format=json&limit=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'MantaApp/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data:
                print(f"{q:45} -> lat: {data[0]['lat']}, lon: {data[0]['lon']}")
            else:
                print(f"{q:45} -> not found")
    except Exception as e:
        print(q, e)

