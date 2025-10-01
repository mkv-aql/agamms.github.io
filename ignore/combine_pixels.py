# Combine two images but keep original colors instead of binarizing

import cv2
import numpy as np
from PIL import Image
from IPython.display import display

# Input paths
path1 = "Sidewalk_Ground_Truth.png"
path2 = "Sidewalk_Ground_Truth2.png"

# Read images in color
img1 = cv2.imread(path1, cv2.IMREAD_COLOR)
img2 = cv2.imread(path2, cv2.IMREAD_COLOR)

# Resize if different sizes
if img1.shape[:2] != img2.shape[:2]:
    img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]), interpolation=cv2.INTER_NEAREST)

# Create masks (non-black pixels are foreground)
mask1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY) > 0
mask2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY) > 0

# Start with black canvas
combined = np.zeros_like(img1)

# Add non-black pixels from both images
combined[mask1] = img1[mask1]
combined[mask2] = img2[mask2]

# Save output
out_path_color = "Sidewalk_Ground_Truth_Combined_Color.png"
cv2.imwrite(out_path_color, combined)

# Show result inline
display(Image.open(out_path_color))

print(f"Saved combined color mask to: {out_path_color}")
