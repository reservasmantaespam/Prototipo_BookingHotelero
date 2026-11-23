with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    text = f.read()

import re
match = re.search(r'// ─── Helper de Enlace Directo a WhatsApp[\s\S]*?(?=// ─── Data)', text)
if match:
    print(match.group(0))

