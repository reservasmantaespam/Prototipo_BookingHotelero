with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    old_text = f.read()

with open("src/GuestPage.tsx", "r", encoding="utf-8") as f:
    new_text = f.read()

# Let's check sections in old that aren't in new:
import re

# 1. HotelReview
print("1. HotelReview in new?", "HotelReview" in new_text)

# 2. DEFAULT_HOTEL_REVIEWS
print("2. DEFAULT_HOTEL_REVIEWS in new?", "DEFAULT_HOTEL_REVIEWS" in new_text)

# 3. Rate plans in Hotel details view
print("3. 'Planes tarifarios disponibles' in new?", "Planes tarifarios disponibles" in new_text)

# 4. Rate plans in Booking modal
print("4. 'ratePlan' in new?", "ratePlan" in new_text)

# 5. Reviews in Home page or portal
print("5. 'reviewsList' in new?", "reviewsList" in new_text)

# 6. Check what else might be in old_text but not in new_text
old_headers = re.findall(r'// ─── ([^─\n]+)', old_text)
new_headers = re.findall(r'// ─── ([^─\n]+)', new_text)

print("\nOld section headers:")
for h in old_headers:
    print(" ", h)

print("\nNew section headers:")
for h in new_headers:
    print(" ", h)

