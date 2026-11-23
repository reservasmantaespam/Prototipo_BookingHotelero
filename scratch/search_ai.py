import re, os, sys
sys.stdout.reconfigure(encoding='utf-8')

def search():
    for fname in ['src/i18n.ts', 'src/App.tsx', 'src/GuestPage.tsx', 'src/hotelData.ts', 'src/MantaMapModal.tsx', 'src/AuthPage.tsx']:
        if not os.path.exists(fname):
            continue
        with open(fname, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        for idx, line in enumerate(lines, 1):
            low = line.lower()
            if any(term in low for term in ['intelig', 'asistent', 'chatbot', 'bot ', ' ia ', '(ia)', 'ai ', 'smart', 'simul']):
                print(f"{fname}:{idx}: {line.strip()[:100]}")

if __name__ == '__main__':
    search()
