with open("scratch/old_hotel_view.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

with open("scratch/plans_and_reviews.txt", "w", encoding="utf-8") as out:
    for l in lines:
        try:
            num = int(l.split(":")[0])
            if 3680 <= num <= 4050:
                out.write(l)
        except:
            pass

print("Saved scratch/plans_and_reviews.txt")

