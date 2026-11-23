import openpyxl, os

wb_path = 'Consolidado-Nacional-2026-publico-8.xlsx'
if os.path.exists(wb_path):
    wb = openpyxl.load_workbook(wb_path, data_only=True)
    print("Sheets in xlsx:", wb.sheetnames)
    sheet = wb.active
    print("Dimensions:", sheet.dimensions)
    rows = list(sheet.iter_rows(values_only=True))
    print(f"Total rows: {len(rows)}")
    header = rows[0]
    print("Header columns:")
    for col_idx, col_name in enumerate(header):
        print(f"  [{col_idx}] {col_name}")
    
    print("\nSample row 1:")
    for col_idx, val in enumerate(rows[1]):
        print(f"  {header[col_idx]}: {val}")
else:
    print("File not found")

