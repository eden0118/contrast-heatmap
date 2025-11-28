#!/bin/bash
# Create placeholder PNG icons
for size in 16 48 128; do
  python3 << PYTHON
from PIL import Image, ImageDraw
img = Image.new('RGB', ($size, $size), color='#3B82F6')
draw = ImageDraw.Draw(img)
draw.text(($size//4, $size//3), "CH", fill='white')
img.save('icon-$size.png')
PYTHON
done
echo "Icons created"
