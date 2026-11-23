with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    old_lines = f.readlines()

print("Lines 3440 to 3520 in old/src/GuestPage.tsx:")
for i in range(3440, min(len(old_lines), 3520)):
    print(f"{i+1}: {old_lines[i]}", end="")

