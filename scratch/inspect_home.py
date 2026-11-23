with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'function HomePage' in l:
        print("Found HomePage at line", i+1)
        for j in range(i, min(i+120, len(lines))):
            print(f"{j+1}: {lines[j].rstrip()}")
        break
