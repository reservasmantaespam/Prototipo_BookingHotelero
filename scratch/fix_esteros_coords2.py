import re

file_path = 'src/mantaHotels.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
is_esteros = False
current_block_indices = []

fixed_count = 0

for i, line in enumerate(lines):
    if '"parroquia": "LOS ESTEROS"' in line:
        is_esteros = True
    
    # When a new hotel starts
    if '  {\n' == line or '  {\r\n' == line:
        is_esteros = False

    new_lines.append(line)

# Let's do it by regex searching for "parroquia": "LOS ESTEROS" and finding the nearest "lat": ... in that hotel object
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# In mantaHotels, each hotel has:
# "name": "...",
# ...
# "parroquia": "LOS ESTEROS",
# ...
# "lat": -0.94...,
# "lng": -80.6...

def replace_esteros(match):
    global fixed_count
    full = match.group(0)
    lat_val = match.group(2)
    old_f = float(lat_val)
    if old_f > -0.9500:
        new_f = round(old_f - 0.0112, 6)
        fixed_count += 1
        return full.replace(f'"lat": {lat_val}', f'"lat": {new_f}')
    return full

pattern = re.compile(r'("parroquia":\s*"LOS ESTEROS"[\s\S]*?"lat":\s*([-0-9.]+))')
fixed_text = pattern.sub(replace_esteros, text)

# Also check if "lat" comes before "parroquia"
pattern2 = re.compile(r'("lat":\s*([-0-9.]+)[\s\S]*?"parroquia":\s*"LOS ESTEROS")')
def replace_esteros2(match):
    global fixed_count
    full = match.group(0)
    lat_val = match.group(2)
    old_f = float(lat_val)
    if old_f > -0.9500:
        new_f = round(old_f - 0.0112, 6)
        fixed_count += 1
        return full.replace(f'"lat": {lat_val}', f'"lat": {new_f}')
    return full

fixed_text = pattern2.sub(replace_esteros2, fixed_text)

print(f"Fixed {fixed_count} hotels in Los Esteros!")
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(fixed_text)

