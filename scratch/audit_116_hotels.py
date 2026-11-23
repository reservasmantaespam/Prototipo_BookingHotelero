with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Match hotel objects
hotels = []
# Find array
start_idx = text.find('export const MANTA_HOTELS: Hotel[] =')
if start_idx != -1:
    array_text = text[start_idx:]
    # count "id": "..." occurrences that are hotel ids
    # Each hotel has "stars": and "city": and "address":
    name_matches = re.findall(r'"name":\s*"([^"]+)"', array_text)
    print("Total hotel name matches in MANTA_HOTELS:", len(name_matches))

    # Let's count lat/lng
    lat_matches = re.findall(r'"lat":\s*(-?[\d\.]+)', array_text)
    lng_matches = re.findall(r'"lng":\s*(-?[\d\.]+)', array_text)
    print("Lat matches:", len(lat_matches), "Lng matches:", len(lng_matches))

    # Let's count images
    img_matches = re.findall(r'"image":\s*"([^"]+)"', array_text)
    print("Image matches:", len(img_matches))

    # Unique images
    unique_imgs = set(img_matches)
    print("Unique images count:", len(unique_imgs))
