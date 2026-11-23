with open("scratch/old_hotel_view.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Let's extract from line 3640 to 3950
lines = text.splitlines()
for l in lines:
    num = int(l.split(":")[0])
    if 3690 <= num <= 3960:
        print(l)

