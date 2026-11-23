with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = re.finditer(r'(opiniones|reseñas|testimonios|huéspedes)', text, re.IGNORECASE)
found = []
for m in matches:
    pos = m.start()
    line_num = text[:pos].count('\n') + 1
    if line_num > 4200: # Home view area
        found.append((line_num, text[pos-30:pos+70].replace('\n', ' ')))

print(f"Found {len(found)} occurrences in lines > 4200:")
for f in found[:15]:
    print(f"  Line {f[0]}: {f[1]}")

