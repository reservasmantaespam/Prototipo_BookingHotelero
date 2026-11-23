import urllib.request
import json

titles = [
    "File:Santa_marianita.jpg",
    "File:Playa_Santa_Marianita.jpg",
    "File:Manta,_Ecuador.jpg",
    "File:Puerto_de_Manta.jpg",
    "File:Puerto_de_Manta_Ecuador.jpg"
]

for t in titles:
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(t)}&prop=imageinfo&iiprop=url&iiurlwidth=1400&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'AlojaMantaApp/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for page_id, page in pages.items():
                if int(page_id) > 0:
                    info = page.get('imageinfo', [{}])[0]
                    print(f"Title: {t}")
                    print(f"  Direct: {info.get('url')}")
    except Exception as e:
        print(t, "Error:", e)
