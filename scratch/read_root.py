with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

with open("scratch/old_root.txt", "w", encoding="utf-8") as out:
    for i in range(4680, 4760):
        out.write(f"{i+1}: {lines[i]}")

print("Saved scratch/old_root.txt")

