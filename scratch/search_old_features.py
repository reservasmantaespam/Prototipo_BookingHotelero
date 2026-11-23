with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    l = line.lower()
    if any(k in l for k in ["hotelreview", "default_hotel_reviews", "rateplan", "tarifario", "selector de plan", "plan tarifario"]):
        print(f"Line {idx+1}: {line.strip()[:110]}")

