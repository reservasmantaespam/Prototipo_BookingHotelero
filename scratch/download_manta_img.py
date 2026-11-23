import urllib.request
import os

os.makedirs('public', exist_ok=True)

url = "https://upload.wikimedia.org/wikipedia/commons/1/1d/Playa_murcielago.jpg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

dest = os.path.join('public', 'manta-playa-murcielago.jpg')
with urllib.request.urlopen(req) as resp:
    data = resp.read()
    with open(dest, 'wb') as f:
        f.write(data)

print(f"Downloaded {len(data)} bytes to {dest}")
