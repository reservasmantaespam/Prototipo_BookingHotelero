with open("old/src/GuestPage.tsx", "r", encoding="utf-8") as f:
    old_content = f.read()

with open("src/GuestPage.tsx", "r", encoding="utf-8") as f:
    new_content = f.read()

print("Old GuestPage lines:", len(old_content.splitlines()))
print("New GuestPage lines:", len(new_content.splitlines()))

# Let's inspect HotelDetailsView in old vs new
import re
old_hd = re.search(r'function HotelDetailsView\([\s\S]*?\n\}', old_content)
new_hd = re.search(r'function HotelDetailsView\([\s\S]*?\n\}', new_content)

print("Old HotelDetailsView found:", bool(old_hd))
print("New HotelDetailsView found:", bool(new_hd))

