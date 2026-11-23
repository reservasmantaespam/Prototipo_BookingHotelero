import urllib.request
import os

url = "https://upload.wikimedia.org/wikipedia/commons/c/c2/Malecon_Escenico_Manta.jpg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

dest = os.path.join('public', 'manta-malecon-escenico.jpg')
try:
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
        with open(dest, 'wb') as f:
            f.write(data)
    print(f"Downloaded {len(data)} bytes to {dest}")
except Exception as e:
    print("Error:", e)
