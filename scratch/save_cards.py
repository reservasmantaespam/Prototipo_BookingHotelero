import re

with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    old_text = f.read()

with open("src/GuestPage.tsx", "r", encoding="utf-8") as f:
    new_text = f.read()

def get_section(txt, start, end):
    m = re.search(f'({re.escape(start)}[\\s\\S]*?)(?={re.escape(end)})', txt)
    return m.group(1) if m else ""

with open("scratch/old_card.txt", "w", encoding="utf-8") as out:
    out.write(get_section(old_text, "// ─── Hotel card ───", "// ─── Hotel detail ───"))

with open("scratch/new_card.txt", "w", encoding="utf-8") as out:
    out.write(get_section(new_text, "// ─── Hotel card ───", "// ─── Hotel detail ───"))

with open("scratch/old_results.txt", "w", encoding="utf-8") as out:
    out.write(get_section(old_text, "// ─── Results ───", "// ─── Home ───"))

with open("scratch/new_results.txt", "w", encoding="utf-8") as out:
    out.write(get_section(new_text, "// ─── Results ───", "// ─── Home ───"))

print("Saved card and results comparison files!")
