with open("src/GuestPage.tsx", "r", encoding="utf-8") as f:
    text = f.read()

import re
home = re.search(r'(// ─── Home ───[\s\S]*?)(?=// ─── Root ───)', text)
if home:
    with open("scratch/current_home.tsx", "w", encoding="utf-8") as out:
        out.write(home.group(1))
    print("Extracted current Home:", len(home.group(1).splitlines()), "lines")

