with open('src/PaymentLinkModal.tsx', 'r', encoding='utf-8') as f:
    t = f.read()
t = t.replace('className="block font-medium mb-1" className="text-slate-700 dark:text-slate-300 font-semibold"', 'className="block font-semibold mb-1 text-slate-700 dark:text-slate-300"')
with open('src/PaymentLinkModal.tsx', 'w', encoding='utf-8') as f:
    f.write(t)
print("Cleaned up labels in PaymentLinkModal")

