import openpyxl

wb = openpyxl.load_workbook('Consolidado-Nacional-2026-publico-8.xlsx', data_only=True)
sheet = wb.active
headers = [cell.value for cell in sheet[1]]
name_idx = headers.index('Nombre Comercial')
parish_idx = headers.index('Parroquia')
ruc_idx = headers.index('RUC')

excel_dict = {}
for i in range(2, sheet.max_row + 1):
    name = str(sheet[i][name_idx].value).strip().upper()
    parish = str(sheet[i][parish_idx].value).strip().upper()
    ruc = str(sheet[i][ruc_idx].value).strip()
    excel_dict[ruc] = (name, parish)

import json
with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
hotels = re.findall(r'\{\s*"id":\s*"([^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"parish":\s*"([^"]+)",[\s\S]*?"taxId":\s*"([^"]+)"', text)

for hid, name, parish, taxId in hotels:
    if taxId in excel_dict:
        ex_name, ex_parish = excel_dict[taxId]
        # Normalize
        norm_p = parish.upper().replace(' ', '')
        norm_ep = ex_parish.upper().replace(' ', '')
        if norm_p != norm_ep:
            print(f"Mismatch: [{hid}] '{name}' -> TS parish: '{parish}' vs Excel parish: '{ex_parish}' (RUC: {taxId})")

