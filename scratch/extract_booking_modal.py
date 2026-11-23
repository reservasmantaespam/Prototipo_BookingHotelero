with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    text = f.read()

import re
old_bm = re.search(r'(// ─── Modal de Reserva ───[\s\S]*?)(?=// ─── Hotel card ───)', text)
if old_bm:
    with open("scratch/old_booking_modal.tsx", "w", encoding="utf-8") as out:
        out.write(old_bm.group(1))
    print(f"Old booking modal: {len(old_bm.group(1).splitlines())} lines")

with open("src/GuestPage.tsx", "r", encoding="utf-8") as f:
    new_text = f.read()

new_bm = re.search(r'(// ─── Booking modal ───[\s\S]*?)(?=// ─── Hotel card ───)', new_text)
if new_bm:
    with open("scratch/new_booking_modal.tsx", "w", encoding="utf-8") as out:
        out.write(new_bm.group(1))
    print(f"New booking modal: {len(new_bm.group(1).splitlines())} lines")

