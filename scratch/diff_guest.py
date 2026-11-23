with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    lines = [f.readline() for _ in range(70)]

for i, l in enumerate(lines[:60]):
    print(f"{i+1}: {l.rstrip()}")
