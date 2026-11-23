import openpyxl

wb = openpyxl.load_workbook('Consolidado-Nacional-2026-publico-8.xlsx', data_only=True)
sheet = wb.active
headers = [cell.value for cell in sheet[1]]
name_idx = headers.index('Nombre Comercial')
parish_idx = headers.index('Parroquia')
ruc_idx = headers.index('RUC')

excel_by_ruc = {}
for i in range(2, sheet.max_row + 1):
    r = str(sheet[i][ruc_idx].value).strip()
    n = str(sheet[i][name_idx].value).strip()
    p = str(sheet[i][parish_idx].value).strip()
    excel_by_ruc[r] = (n, p)

import subprocess
# Get hotels as json via node
res = subprocess.run(["node", "-e", """
const fs = require('fs');
const code = fs.readFileSync('./src/mantaHotels.ts', 'utf-8');
const match = code.match(/export const MANTA_HOTELS: Hotel\\[\\] = (\\[[\\s\\S]*?\\n\\];)/);
const hotels = eval(match[1].replace(/;\\s*$/, ''));
console.log(JSON.stringify(hotels.map(h => ({id: h.id, name: h.name, parish: h.parish, taxId: h.taxId}))));
"""], capture_output=True, text=True, check=True)

import json
ts_hotels = json.loads(res.stdout)
for h in ts_hotels:
    ruc = h['taxId']
    if ruc in excel_by_ruc:
        ex_name, ex_parish = excel_by_ruc[ruc]
        p1 = h['parish'].upper().replace(' ', '')
        p2 = ex_parish.upper().replace(' ', '')
        if p1 != p2:
            print(f"Mismatch: [{h['id']}] '{h['name']}' -> TS: '{h['parish']}' vs Excel: '{ex_parish}' (RUC: {ruc})")
    else:
        print(f"RUC not in excel: {h['name']} ({ruc})")

