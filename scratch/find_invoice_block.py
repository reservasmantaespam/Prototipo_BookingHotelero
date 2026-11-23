with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'step === "invoice"' in line:
        for j in range(i, min(len(lines), i+35)):
            print(f'{j+1}: {lines[j]}', end='')
        break
