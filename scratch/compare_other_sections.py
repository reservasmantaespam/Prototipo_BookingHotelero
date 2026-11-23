with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    old_text = f.read()

with open("src/GuestPage.tsx", "r", encoding="utf-8") as f:
    new_text = f.read()

# Let's check what lines old has in HotelCard, Results, Home
import re
def get_section(txt, start, end):
    m = re.search(f'({re.escape(start)}[\\s\\S]*?)(?={re.escape(end)})', txt)
    return m.group(1) if m else ""

old_card = get_section(old_text, "// ─── Hotel card ───", "// ─── Hotel detail ───")
new_card = get_section(new_text, "// ─── Hotel card ───", "// ─── Hotel detail ───")
print(f"Hotel card lines: old={len(old_card.splitlines())}, new={len(new_card.splitlines())}")

old_res = get_section(old_text, "// ─── Results ───", "// ─── Home ───")
new_res = get_section(new_text, "// ─── Results ───", "// ─── Home ───")
print(f"Results lines: old={len(old_res.splitlines())}, new={len(new_res.splitlines())}")

old_home = get_section(old_text, "// ─── Home ───", "// ─── Root ───")
new_home = get_section(new_text, "// ─── Home ───", "// ─── Root ───")
print(f"Home lines: old={len(old_home.splitlines())}, new={len(new_home.splitlines())}")

