import re

with open('scratch/backup_booking_modal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

steps = re.findall(r'step === "([^"]+)"', code)
print('Steps found in backup BookingModal:', set(steps))

# Find form submission / pay handler
idx_pay = code.find('function handlePay')
print('handlePay snippet:\n', code[idx_pay:idx_pay+1200])
