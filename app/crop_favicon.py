from PIL import Image

img = Image.open('public/AI_CV_Scan_Logo.png')
img = img.convert("RGBA")

width, height = img.size
pixels = img.load()

x_min, x_max = width, 0
y_min, y_max = height, 0
found = False

# Find the bounding box of the blue "CV"
for x in range(width):
    for y in range(height):
        r, g, b, a = pixels[x, y]
        if int(b) - int(r) > 30 and int(b) - int(g) > 30 and a > 128 and b > 100:
            if x < x_min: x_min = x
            if x > x_max: x_max = x
            if y < y_min: y_min = y
            if y > y_max: y_max = y
            found = True

if found:
    # 1. Crop exactly the CV part (no padding yet)
    cv_crop = img.crop((x_min, y_min, x_max, y_max))
    
    # 2. Determine square size with padding
    w = x_max - x_min
    h = y_max - y_min
    size = int(max(w, h) * 1.15) # 15% padding
    
    # 3. Create a new transparent square image
    new_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # 4. Calculate paste position to center the CV
    paste_x = (size - w) // 2
    paste_y = (size - h) // 2
    
    # 5. Paste the exact CV crop into the center
    new_img.paste(cv_crop, (paste_x, paste_y))
    
    # Save
    new_img.save('app/icon.png')
    
    print("Cropped successfully without the S!")
else:
    print("Could not find blue text.")
