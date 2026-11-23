import re

with open("scratch/old_booking_modal.tsx", "r", encoding="utf-8") as f:
    old_bm = f.read()

with open("scratch/new_booking_modal.tsx", "r", encoding="utf-8") as f:
    new_bm = f.read()

features = [
    "ratePlan",
    "buildWhatsAppUrl",
    "whatsapp",
    "pago en el hotel",
    "cancelar en el hotel",
    "saldo",
    "voucher",
    "observaciones",
    "preferencias",
    "parking",
    "pet friendly",
    "petición especial"
]

for feat in features:
    old_c = len([m for m in re.finditer(re.escape(feat), old_bm, re.IGNORECASE)])
    new_c = len([m for m in re.finditer(re.escape(feat), new_bm, re.IGNORECASE)])
    print(f"Feature '{feat}': old={old_c}, new={new_c}")
