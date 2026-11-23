import re

def get_functions(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    fns = re.findall(r'function\s+([A-Za-z0-9_]+)', content)
    return set(fns)

angelo_fns = get_functions('src/GuestPage.tsx')

import subprocess
res = subprocess.run(['git', 'show', 'backup-local-manta-pre-integracion:src/GuestPage.tsx'], capture_output=True, text=True, encoding='utf-8')
backup_content = res.stdout
backup_fns = set(re.findall(r'function\s+([A-Za-z0-9_]+)', backup_content))

print(f"Angelo functions count: {len(angelo_fns)}")
print(f"Backup functions count: {len(backup_fns)}")
print("Only in Angelo:", angelo_fns - backup_fns)
print("Only in Backup:", backup_fns - angelo_fns)
