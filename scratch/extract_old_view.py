with open("old/src/GuestPage.tsx", "r", encoding="utf-8", errors="replace") as f:
    old_lines = f.readlines()

with open("scratch/old_hotel_view.txt", "w", encoding="utf-8") as out:
    for i in range(3430, min(len(old_lines), 4300)):
        out.write(f"{i+1}: {old_lines[i]}")

print("Wrote scratch/old_hotel_view.txt")

