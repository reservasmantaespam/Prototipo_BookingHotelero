with open('scratch/backup_booking_modal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('step === "payment"')
print(code[idx:idx+2500])
