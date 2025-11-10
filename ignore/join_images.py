import cv2
import numpy as np

# Input paths
img1_path = "Interpolation Before.jpg"
img2_path = "Interpolation After.jpg"

# Read images
img1 = cv2.imread(img1_path, cv2.IMREAD_COLOR)
img2 = cv2.imread(img2_path, cv2.IMREAD_COLOR)

# Resize second image to match height of first
if img1.shape[0] != img2.shape[0]:
    scale = img1.shape[0] / img2.shape[0]
    new_width = int(img2.shape[1] * scale)
    img2 = cv2.resize(img2, (new_width, img1.shape[0]), interpolation=cv2.INTER_NEAREST)

# Concatenate side by side
joined = np.hstack((img1, img2))

# Save result
cv2.imwrite("Interpolation before after.jpg", joined)
print("Saved to Boundary_Ground_Truth_SideBySide.png")
