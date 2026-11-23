with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = re.finditer(r'// ─── ([^─\n]+)', text)
for m in matches:
    pos = m.start()
    line_num = text[:pos].count('\n') + 1
    print(f"Line {line_num}: {m.group(1)}")

