import re

file_path = 'src/mantaHotels.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find hotel blocks in LOS ESTEROS
# Each hotel has: "parroquia": "LOS ESTEROS" and "lat": -0.94..., "lng": ...
def fix_hotel(match):
    block = match.group(0)
    lat_m = re.search(r'"lat":\s*([-0-9.]+)', block)
    if lat_m:
        old_lat = float(lat_m.group(1))
        # if lat is around -0.94xxx (in the ocean), adjust it down into land by 0.0112 degrees
        if old_lat > -0.9500:
            new_lat = round(old_lat - 0.0112, 6)
            block = block.replace(f'"lat": {lat_m.group(1)}', f'"lat": {new_lat}')
            print(f"Fixed: {old_lat} -> {new_lat}")
    return block

# Match hotel objects
pattern = re.compile(r'\{[^{}]*?"parroquia":\s*"LOS ESTEROS"[^{}]*?\}', re.DOTALL)
new_content = pattern.sub(fix_hotel, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated Los Esteros hotels in src/mantaHotels.ts successfully!")

