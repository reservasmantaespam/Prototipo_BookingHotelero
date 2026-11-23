import openpyxl
import json
import re

wb = openpyxl.load_workbook('Consolidado-Nacional-2026-publico-8.xlsx', data_only=True)
sheet = wb.active
headers = [cell.value for cell in sheet[1]]
print("Headers:", headers)

excel_hotels = []
for i in range(2, sheet.max_row + 1):
    row = [cell.value for cell in sheet[i]]
    excel_hotels.append(dict(zip(headers, row)))

print(f"Total Excel hotels: {len(excel_hotels)}")

# Read mantaHotels.ts
with open("src/mantaHotels.ts", "r", encoding="utf-8") as f:
    ts_code = f.read()

# Check parish mapping in Excel
parish_map = {}
for h in excel_hotels:
    p = h.get('Parroquia')
    parish_map[p] = parish_map.get(p, 0) + 1

print("\nOfficial Excel Parishes:")
for p, c in sorted(parish_map.items()):
    print(f"  {p}: {c}")

