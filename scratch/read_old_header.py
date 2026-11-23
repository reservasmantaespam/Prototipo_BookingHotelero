with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

with open("scratch/old_header_section.txt", "w", encoding="utf-8") as out:
    for i in range(50, 160):
        out.write(f"{i+1}: {lines[i]}")

print("Saved scratch/old_header_section.txt")

