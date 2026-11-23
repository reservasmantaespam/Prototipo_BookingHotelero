import re

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Parse all hotels
raw_blocks = re.split(r'\n  \{', text)[1:]
print(f"Total hotel blocks: {len(raw_blocks)}")

def is_in_ocean(lat, lng, parroquia):
    # San Lorenzo
    if lng < -80.890:
        if lng < -80.912 or lat > -1.055:
            return True, "San Lorenzo: Too far west/north in sea"
    # Santa Marianita
    elif lng < -80.830:
        if lng < -80.844 or lat > -1.010:
            return True, "Santa Marianita: West of beach in sea"
    # San Mateo
    elif lng < -80.780:
        if lng < -80.816 or lat > -0.981:
            return True, "San Mateo: In sea"
    # Barbasquillo / Piedra Larga
    elif lng < -80.742:
        # Coastline line roughly: at -80.755 lat is -0.962; at -80.742 lat is -0.951
        coast_lat = -0.951 - (lng - (-80.742)) * ((-0.962 - (-0.951)) / (-80.755 - (-80.742)))
        if lat > coast_lat + 0.0015:
            return True, f"Barbasquillo: lat {lat:.4f} > coast {coast_lat:.4f} (in sea)"
    # Murcielago & Centro
    elif lng < -80.720:
        # Playa Murcielago coast is around lat -0.9485
        if lat > -0.9475:
            return True, f"Murcielago: lat {lat:.4f} > -0.9475 (in sea)"
    # Tarqui
    elif lng < -80.700:
        # Tarqui beach coast is around -0.9525
        if lat > -0.9520:
            return True, f"Tarqui: lat {lat:.4f} > -0.9520 (in sea)"
    # Los Esteros
    else:
        # Los Esteros coast is around -0.9515
        if lat > -0.9510:
            return True, f"Los Esteros: lat {lat:.4f} > -0.9510 (in sea)"
    
    return False, "Land"

ocean_hotels = []
for i, b in enumerate(raw_blocks):
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    parr_m = re.search(r'"parroquia":\s*"([^"]+)"', b)
    lat_m = re.search(r'"lat":\s*([-0-9.]+)', b)
    lng_m = re.search(r'"lng":\s*([-0-9.]+)', b)
    addr_m = re.search(r'"address":\s*"([^"]+)"', b)
    tags_m = re.search(r'"tags":\s*\[([\s\S]*?)\]', b)

    name = name_m.group(1) if name_m else '?'
    parr = parr_m.group(1) if parr_m else '?'
    addr = addr_m.group(1) if addr_m else '?'
    lat = float(lat_m.group(1)) if lat_m else 0
    lng = float(lng_m.group(1)) if lng_m else 0
    tags = [t.strip().strip('"') for t in tags_m.group(1).split(',')] if tags_m else []

    in_sea, reason = is_in_ocean(lat, lng, parr)
    if in_sea:
        ocean_hotels.append((i+1, name, parr, addr, lat, lng, reason, "Frente al Mar" in tags))

print(f"Total hotels evaluated: {len(raw_blocks)}")
print(f"Hotels falling in OCEAN: {len(ocean_hotels)}")
for idx, name, parr, addr, lat, lng, reason, f_mar in ocean_hotels[:25]:
    print(f"[{idx:3}] {name:30} | {parr:15} | lat: {lat:.5f}, lng: {lng:.5f} | FrenteMar: {str(f_mar):5} | {reason}")

