import openpyxl, subprocess, json

wb = openpyxl.load_workbook('Consolidado-Nacional-2026-publico-8.xlsx', data_only=True)
sheet = wb.active
headers = [cell.value for cell in sheet[1]]
name_idx = headers.index('Nombre Comercial')
parish_idx = headers.index('Parroquia')
reg_idx = headers.index('Número de Registro') if 'Número de Registro' in headers else 2

excel_rows = []
for i in range(2, sheet.max_row + 1):
    excel_rows.append({
        'name': str(sheet[i][name_idx].value).strip(),
        'parish': str(sheet[i][parish_idx].value).strip(),
        'reg': str(sheet[i][reg_idx].value).strip() if reg_idx else ''
    })

res = subprocess.run(["node", "-e", """
const fs = require('fs');
const code = fs.readFileSync('./src/mantaHotels.ts', 'utf-8');
const match = code.match(/export const MANTA_HOTELS: Hotel\\[\\] = (\\[[\\s\\S]*?\\n\\];)/);
const hotels = eval(match[1].replace(/;\\s*$/, ''));
console.log(JSON.stringify(hotels.map(h => ({id: h.id, name: h.name, parish: h.parish, regNumber: h.regNumber}))));
"""], capture_output=True, text=True, check=True)

ts_hotels = json.loads(res.stdout)

# Find the 16 Tarqui in Excel:
tarqui_in_excel = [x['name'] for x in excel_rows if x['parish'].upper() == 'TARQUI']
print(f"Tarqui in Excel ({len(tarqui_in_excel)}):")
for t in tarqui_in_excel:
    # find in ts_hotels
    found = None
    for th in ts_hotels:
        if th['name'].upper() == t.upper():
            found = th
            break
    if found:
        print(f"  '{t}' -> TS parish: '{found['parish']}' (id: {found['id']})")
    else:
        print(f"  '{t}' -> NOT FOUND in TS by name")

