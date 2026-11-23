import os

old_files = os.listdir("old/src")
current_files = os.listdir("src")

print("Files in old/src:", old_files)
print("Files in src:", current_files)

# Compare sizes and key differences
for f in old_files:
    if f in current_files and os.path.isfile(f"old/src/{f}"):
        old_size = os.path.getsize(f"old/src/{f}")
        cur_size = os.path.getsize(f"src/{f}")
        print(f"\nFile: {f} | Old size: {old_size} bytes | New size: {cur_size} bytes")

