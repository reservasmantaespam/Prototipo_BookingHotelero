import urllib.request

urls = [
    "https://upload.wikimedia.org/wikipedia/commons/c/c8/Manta_Ecuador_playa_Murci%C3%A9lago_02.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/1d/Playa_murcielago.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6e/Ecuador_Manta_Murci%C3%A9lago_beach_01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/55/Playa_Santa_Marianita.jpg"
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as r:
            print(r.status, len(r.read()), u.split('/')[-1])
    except Exception as e:
        print("FAIL", u.split('/')[-1], e)
