from PIL import Image, ImageDraw
from geometry import calculate_grid_positions, calculate_spiral_positions

class CorrectionEngine:
    def __init__(self):
        pass

    def generate_grid_mask(self, width, height, rows, cols, detected_boxes=None):
        """
        Generates a correction mask for a Grid layout.
        If detected_boxes passed, could try to only mask missing areas.
        For now, generates a full 'Guide' mask.
        """
        print(f"🛠️  Generating Grid Mask ({rows}x{cols}) for {width}x{height} image")
        
        mask = Image.new('RGB', (width, height), (0, 0, 0)) # Black background
        draw = ImageDraw.Draw(mask)
        
        # Grid settings (should ideally come from spec)
        cell_w = width / (cols + 1) # Approximation
        spacing = 20
        grid_w = cols * (cell_w + spacing) - spacing
        grid_h = rows * (cell_w + spacing) - spacing
        
        start_x = (width - grid_w) / 2
        start_y = (height - grid_h) / 2
        top_left = (start_x, start_y)
        
        # Calculate ideal positions
        centers = calculate_grid_positions(top_left, rows, cols, cell_w, cell_w, spacing)
        
        for i, (cx, cy) in enumerate(centers):
            # Draw white box (The "Hole" to fill or the "Guide" to keep)
            # In inpainting: White = Inpaint (Change), Black = Keep.
            # OR in ControlNet: This is the structure guide.
            
            # Let's assume this is a Canny/Depth ControlNet input
            # We draw what we WANT to see.
            half = cell_w / 2
            x1, y1 = cx - half, cy - half
            x2, y2 = cx + half, cy + half
            
            # Draw a clean rectangle outline
            draw.rectangle([x1, y1, x2, y2], outline=(255, 255, 255), width=5)
            
            # Draw number hint
            # draw.text((cx, cy), str(i+1), fill=(255, 255, 255))
            
        return mask

    def generate_spiral_mask(self, width, height, count):
        print(f"🛠️  Generating Spiral Mask ({count} items)")
        mask = Image.new('RGB', (width, height), (0, 0, 0))
        draw = ImageDraw.Draw(mask)
        
        center = (width/2, height/2)
        points = calculate_spiral_positions(center, count, 'logarithmic', a=20, b=0.35, turns=2.5)
        
        for i, (cx, cy) in enumerate(points):
            r = 30 # item radius
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(255, 255, 255), width=3)
            
        return mask
