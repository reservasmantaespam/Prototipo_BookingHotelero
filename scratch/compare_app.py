with open("old/src/App.tsx", "r", encoding="utf-8") as f:
    old_app = f.read()

with open("src/App.tsx", "r", encoding="utf-8") as f:
    new_app = f.read()

import re
print("Checking keywords in old App.tsx vs new App.tsx:")
keywords = ["voucher", "correo", "email", "pms", "preferencias", "observaciones", "habitaciones", "procesadas", "no procesadas", "rateplan"]
for k in keywords:
    old_c = len(re.findall(re.escape(k), old_app, re.IGNORECASE))
    new_c = len(re.findall(re.escape(k), new_app, re.IGNORECASE))
    print(f"Keyword '{k}': old={old_c}, new={new_c}")

