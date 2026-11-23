import shutil
import os

os.makedirs('src/assets', exist_ok=True)
shutil.copy('public/manta-playa-murcielago.jpg', 'src/assets/manta-playa-murcielago.jpg')
print("Copied to src/assets/manta-playa-murcielago.jpg")
