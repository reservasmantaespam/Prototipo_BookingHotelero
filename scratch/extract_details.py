with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    text = f.read()

import re
old_hotel_detail = re.search(r'(// ─── Hotel detail ───[\s\S]*?)(?=// ─── Results ───)', text)
if old_hotel_detail:
    with open("scratch/old_hotel_detail.tsx", "w", encoding="utf-8") as out:
        out.write(old_hotel_detail.group(1))
    print(f"Old hotel detail extracted: {len(old_hotel_detail.group(1).splitlines())} lines")

with open("src/GuestPage.tsx", "r", encoding="utf-8") as f:
    new_text = f.read()

new_hotel_detail = re.search(r'(// ─── Hotel detail ───[\s\S]*?)(?=// ─── Results ───)', new_text)
if new_hotel_detail:
    with open("scratch/new_hotel_detail.tsx", "w", encoding="utf-8") as out:
        out.write(new_hotel_detail.group(1))
    print(f"New hotel detail extracted: {len(new_hotel_detail.group(1).splitlines())} lines")

