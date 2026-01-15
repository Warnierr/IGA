import numpy as np
import math

def calculate_grid_positions(top_left, rows, cols, cell_width, cell_height, spacing=0):
    """
    Calculate exact centers for a grid.
    top_left: (x, y) tuple
    """
    positions = []
    start_x, start_y = top_left
    
    for row in range(rows):
        for col in range(cols):
            x = start_x + col * (cell_width + spacing) + cell_width / 2
            y = start_y + row * (cell_height + spacing) + cell_height / 2
            positions.append((x, y))
            
    return positions

def calculate_spiral_positions(center, count, spiral_type='logarithmic', a=0, b=0.35, start_angle=0, turns=2):
    """
    Calculate points along a spiral.
    center: (x, y) tuple
    """
    cx, cy = center
    points = []
    
    # Calculate angles
    total_angle = turns * 2 * np.pi
    start_rad = math.radians(start_angle)
    
    for i in range(count):
        t = i / max(1, count - 1)
        theta = start_rad + t * total_angle
        
        radius = 0
        if spiral_type == 'archimedean':
            radius = a + b * theta
        else:
            # logarithmic: r = a * e^(b * theta)
            # Use small b for log (e.g. 0.35)
            # 'a' in our TS code was around 20 for log spiral base
            radius = max(1, a) * np.exp(b * theta)
            
        x = cx + radius * math.cos(theta)
        y = cy + radius * math.sin(theta)
        
        # Calculate tangent rotation (degrees)
        # Derivative of log spiral: dr/dtheta = b * r
        # angle psi between tangent and radial line: tan(psi) = r / (dr/dtheta) = 1/b
        # geometric tangent = theta + psi (approx)
        
        # Simple tangent approximation using next step delta would be robust for generic curves
        # But here we return just points
        points.append((x, y))
        
    return points

def generate_mandala_mask(width, height, axes=12, layers=[]):
    """
    Generate a simple mask image for Mandala structure
    (Placeholder for full implementation)
    """
    # In a real implementation, this would draw the mandala using OpenCV/Cairo
    # based on the layers config
    pass
