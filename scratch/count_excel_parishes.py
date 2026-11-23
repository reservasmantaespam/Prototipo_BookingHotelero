import openpyxl

wb = openpyxl.load_workbook('Consolidado-Nacional-2026-publico-8.xlsx', data_only=True)
sheet = wb.active
rows = list(sheet.iter_rows(values_only=True))[1:]

parishes = {}
for r in rows:
    p = str(r[9]).strip().upper()
    parishes[p] = parishes.get(p, 0) + 1

print("Hotels per parish in official Excel:")
for p, c in sorted(parishes.items()):
    print(f"  {p:20}: {c}")
print(f"Total: {sum(parishes.values())}")

