import urllib.request
import json
import time

with open("scratch/final_refined_hotels.json", "r", encoding="utf-8") as f:
    hotels = json.load(f)

# Pick 1 hotel per parish:
parishes = ["Manta", "Tarqui", "Los Esteros", "San Mateo", "Santa Marianita", "San Lorenzo", "Eloy Alfaro"]
sample = []
for p in parishes:
    found = next(h for h in hotels if h["parish"] == p)
    sample.append(found)

for h in sample:
    lat, lng = h["lat"], h["lng"]
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "MantaVerification/1.0"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            addr = data.get("display_name", "Unknown")
            print(f"[{h['parish']}] '{h['name']}': [{lat}, {lng}] -> {addr[:85]}")
    except Exception as e:
        print(f"[{h['parish']}] '{h['name']}': Error {e}")
    time.sleep(1)

