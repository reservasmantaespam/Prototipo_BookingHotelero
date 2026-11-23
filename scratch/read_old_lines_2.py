with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    old_lines = f.readlines()

print("Lines 3520 to 3760 in old/src/GuestPage.tsx:")
for i in range(3520, min(len(old_lines), 3760)):
    print(f"{i+1}: {old_lines[i]}", end="")

