import subprocess

cmd = ['git', 'show', 'backup-local-manta-pre-integracion:src/GuestPage.tsx']
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
lines = res.stdout.splitlines()[:60]
for i, l in enumerate(lines):
    print(f"{i+1}: {l}")
