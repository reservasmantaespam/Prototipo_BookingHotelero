import os

# 1. Update src/SriInvoiceModal.tsx
with open('src/SriInvoiceModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the receipt registration box
start_marker = '{/* Hotel Action Box: Register Invoice Number */}'
end_marker = '{/* Data card de estancia y pago */}'

i1 = text.find(start_marker)
i2 = text.find(end_marker)
if i1 != -1 and i2 != -1:
    text = text[:i1] + text[i2:]
    print("Hotel Action Box removed successfully")
else:
    print("Warning: could not find Action Box markers")

# Replace header badge
old_badge_part = '{savedHotelInvoice ? ('
if old_badge_part in text:
    # let's locate the div containing savedHotelInvoice
    b_start = text.find('<div className="flex items-center gap-1.5 flex-shrink-0">')
    b_end = text.find('</div>\r\n        </div>\r\n\r\n        {/* Modal scrollable body */}')
    if b_end == -1:
        b_end = text.find('</div>\n        </div>\n\n        {/* Modal scrollable body */}')
    if b_start != -1 and b_end != -1:
        replacement = ('<div className="flex items-center gap-1.5 flex-shrink-0">\r\n'
                       '            <span className="mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">\r\n'
                       '              ✓ {tx("Pago Digital Verificado")}\r\n'
                       '            </span>\r\n          ')
        text = text[:b_start] + replacement + text[b_end:]
        print("Header badge updated successfully")

with open('src/SriInvoiceModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

