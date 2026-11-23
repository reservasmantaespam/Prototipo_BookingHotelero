with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

with open("scratch/old_whatsapp_helper.txt", "w", encoding="utf-8") as out:
    for i in range(15, 55):
        out.write(f"{i+1}: {lines[i]}")

print("Saved scratch/old_whatsapp_helper.txt")

