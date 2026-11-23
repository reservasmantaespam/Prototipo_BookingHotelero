with open("scratch/old_hotel_view.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Planes tarifarios" in line or "ratePlan" in line or "Reseñas" in line or "reviewsList" in line:
        print(f"Line {i}: {line.strip()[:100]}")

