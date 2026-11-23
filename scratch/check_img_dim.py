from PIL import Image

im = Image.open('public/manta-playa-murcielago.jpg')
print("Dimensions:", im.size, im.format)
