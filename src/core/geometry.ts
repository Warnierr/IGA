/**
 * Geometry Module - Core spatial calculations
 * 
 * Provides mathematically exact positioning for overlay elements.
 * All calculations are deterministic and produce identical results.
 * 
 * @module core/geometry
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Point {
    x: number;
    y: number;
}

export interface PolarCoord {
    radius: number;
    angle: number; // in degrees
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type Direction = 'cw' | 'ccw';

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
    return degrees * DEG_TO_RAD;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
    return radians * RAD_TO_DEG;
}

/**
 * Normalize angle to [0, 360) range
 */
export function normalizeAngle(angle: number): number {
    let normalized = angle % 360;
    if (normalized < 0) {
        normalized += 360;
    }
    return normalized;
}

/**
 * Convert polar coordinates to Cartesian
 * 
 * Standard mathematical convention:
 * - 0° points right (positive X axis)
 * - Angles increase counter-clockwise
 * 
 * @param center - Center point
 * @param polar - Polar coordinates (radius, angle in degrees)
 * @returns Cartesian point
 */
export function polarToCartesian(center: Point, polar: PolarCoord): Point {
    const angleRad = toRadians(polar.angle);
    return {
        x: center.x + polar.radius * Math.cos(angleRad),
        y: center.y + polar.radius * Math.sin(angleRad),
    };
}

/**
 * Convert Cartesian coordinates to polar
 * 
 * @param center - Center point
 * @param point - Cartesian point
 * @returns Polar coordinates (radius, angle in degrees)
 */
export function cartesianToPolar(center: Point, point: Point): PolarCoord {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return {
        radius: Math.sqrt(dx * dx + dy * dy),
        angle: normalizeAngle(toDegrees(Math.atan2(dy, dx))),
    };
}

/**
 * Calculate the angle step for N segments
 */
export function calculateAngleStep(count: number): number {
    return 360 / count;
}

/**
 * Get direction multiplier
 * In SVG/screen coordinates, Y increases downward, so:
 * - CW (clockwise) = positive angle increment
 * - CCW (counter-clockwise) = negative angle increment
 */
export function getDirectionMultiplier(direction: Direction): number {
    return direction === 'cw' ? 1 : -1;
}

/**
 * Calculate positions for N segments around a circle
 * 
 * @param center - Center of circle
 * @param radius - Radius of circle
 * @param count - Number of segments
 * @param startAngle - Starting angle in degrees (0 = right, 90 = bottom in SVG coords)
 * @param direction - 'cw' for clockwise, 'ccw' for counter-clockwise
 * @returns Array of points for each segment
 */
export function calculateSegmentPositions(
    center: Point,
    radius: number,
    count: number,
    startAngle: number = 0,
    direction: Direction = 'cw'
): Point[] {
    const angleStep = calculateAngleStep(count);
    const dirMultiplier = getDirectionMultiplier(direction);

    const positions: Point[] = [];

    for (let i = 0; i < count; i++) {
        const angle = normalizeAngle(startAngle + i * angleStep * dirMultiplier);
        positions.push(
            polarToCartesian(center, { radius, angle })
        );
    }

    return positions;
}

/**
 * Calculate line endpoints for segment markers (from center to edge)
 */
export function calculateSegmentLines(
    center: Point,
    innerRadius: number,
    outerRadius: number,
    count: number,
    startAngle: number = 0,
    direction: Direction = 'cw'
): Array<{ start: Point; end: Point; angle: number }> {
    const angleStep = calculateAngleStep(count);
    const dirMultiplier = getDirectionMultiplier(direction);

    const lines: Array<{ start: Point; end: Point; angle: number }> = [];

    for (let i = 0; i < count; i++) {
        const angle = normalizeAngle(startAngle + i * angleStep * dirMultiplier);
        lines.push({
            start: polarToCartesian(center, { radius: innerRadius, angle }),
            end: polarToCartesian(center, { radius: outerRadius, angle }),
            angle,
        });
    }

    return lines;
}

/**
 * Calculate clock hand angles from time string
 * 
 * Returns angles with 0° = top (12 o'clock), increasing clockwise
 * 
 * @param time - Time string in format "HH:MM" or "HH:MM:SS"
 * @returns Angles in degrees for hour, minute, and second hands
 */
export function calculateHandAngles(time: string): {
    hour: number;
    minute: number;
    second: number;
} {
    const parts = time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts.length > 2 ? parseInt(parts[2], 10) : 0;

    // Calculate angles (0° = top = 12 o'clock)
    // Hour hand: 30° per hour + 0.5° per minute
    const hourAngle = ((hours % 12) * 30) + (minutes * 0.5);

    // Minute hand: 6° per minute + 0.1° per second
    const minuteAngle = (minutes * 6) + (seconds * 0.1);

    // Second hand: 6° per second
    const secondAngle = seconds * 6;

    return {
        hour: normalizeAngle(hourAngle - 90), // Adjust -90° because 0° is at east, we want north
        minute: normalizeAngle(minuteAngle - 90),
        second: normalizeAngle(secondAngle - 90),
    };
}

/**
 * Calculate centroids for 3-circle Venn diagram
 * 
 * Arranges 3 circles in a triangular pattern with optimal overlap
 * 
 * @param center - Center of the overall diagram
 * @param radius - Radius of each individual circle
 * @returns Array of 3 center points for the circles
 */
export function calculateVennCentroids(center: Point, radius: number): Point[] {
    // For a 3-circle Venn with optimal overlap, we use an equilateral triangle
    // The circles are positioned so they overlap by approximately 1/3 of their diameter

    // Distance from diagram center to each circle center
    // For good overlap: distance ≈ 0.6 * radius
    const offset = radius * 0.6;

    // Three circles at 120° intervals, starting at top
    const angles = [-90, 30, 150]; // degrees

    return angles.map(angle =>
        polarToCartesian(center, { radius: offset, angle })
    );
}

/**
 * Calculate intersection points between two circles
 * 
 * @param c1 - Center of first circle
 * @param r1 - Radius of first circle
 * @param c2 - Center of second circle
 * @param r2 - Radius of second circle
 * @returns Array of intersection points (0, 1, or 2 points)
 */
export function circleIntersections(
    c1: Point,
    r1: number,
    c2: Point,
    r2: number
): Point[] {
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    // No intersection
    if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) {
        return [];
    }

    // One circle contains the other
    if (d + Math.min(r1, r2) === Math.max(r1, r2)) {
        return [];
    }

    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);

    const px = c1.x + (dx * a) / d;
    const py = c1.y + (dy * a) / d;

    const p1: Point = {
        x: px + (h * dy) / d,
        y: py - (h * dx) / d,
    };

    const p2: Point = {
        x: px - (h * dy) / d,
        y: py + (h * dx) / d,
    };

    // If h is very small, it's essentially one point
    if (h < 0.0001) {
        return [{ x: px, y: py }];
    }

    return [p1, p2];
}

/**
 * Calculate approximate centroid of a region defined by intersection of circles
 * 
 * For Venn diagram label placement
 */
export function calculateIntersectionCentroid(points: Point[]): Point {
    if (points.length === 0) {
        return { x: 0, y: 0 };
    }

    const sum = points.reduce(
        (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
        { x: 0, y: 0 }
    );

    return {
        x: sum.x / points.length,
        y: sum.y / points.length,
    };
}

/**
 * Calculate grid positions for a rows×cols layout
 * 
 * @param topLeft - Top-left corner of the grid
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param cellWidth - Width of each cell
 * @param cellHeight - Height of each cell
 * @param spacing - Spacing between cells
 * @returns Array of center points for each cell (row-major order)
 */
export function calculateGridPositions(
    topLeft: Point,
    rows: number,
    cols: number,
    cellWidth: number,
    cellHeight: number,
    spacing: number = 0
): Point[] {
    const positions: Point[] = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            positions.push({
                x: topLeft.x + col * (cellWidth + spacing) + cellWidth / 2,
                y: topLeft.y + row * (cellHeight + spacing) + cellHeight / 2,
            });
        }
    }

    return positions;
}

/**
 * Calculate positions along a spiral
 * 
 * Supports Archimedean (r = a + bθ) and Logarithmic (r = a * e^(bθ)) spirals
 * 
 * @param center - Center of the spiral
 * @param count - Number of points
 * @param type - 'archimedean' or 'logarithmic'
 * @param a - Start radius or offset
 * @param b - Growth factor
 * @param startAngle - Starting angle in degrees
 * @param turns - Total number of turns (rotations)
 * @returns Array of points along the spiral
 */
export function calculateSpiralPositions(
    center: Point,
    count: number,
    type: 'archimedean' | 'logarithmic',
    a: number,
    b: number,
    startAngle: number = 0,
    turns: number = 2
): Point[] {
    const points: Point[] = [];
    const totalAngle = turns * 2 * Math.PI; // Total rotation in radians
    const startRad = (startAngle * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
        // Progress t goes from 0 to 1
        const t = i / (count - 1 || 1);
        const theta = startRad + t * totalAngle;

        let radius = 0;
        if (type === 'archimedean') {
            // r = a + b * theta
            radius = a + b * theta;
        } else {
            // r = a * e^(b * theta)
            // Note: b should be small for log spiral (e.g., 0.1 - 0.3)
            radius = a * Math.exp(b * theta);
        }

        points.push({
            x: center.x + radius * Math.cos(theta),
            y: center.y + radius * Math.sin(theta)
        });
    }

    return points;
}

/**
 * Calculate distance between two points
 */
export function distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two bounding boxes overlap
 */
export function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
    return !(
        a.x + a.width < b.x ||
        b.x + b.width < a.x ||
        a.y + a.height < b.y ||
        b.y + b.height < a.y
    );
}

/**
 * Get label anchor based on angle (for proper text alignment in SVG)
 * 
 * Returns text-anchor value for SVG text element
 */
export function getLabelAnchor(angle: number): 'start' | 'middle' | 'end' {
    const normalized = normalizeAngle(angle);

    // Right side: start
    if ((normalized >= 315 && normalized < 360) || (normalized >= 0 && normalized < 45)) {
        return 'start';
    }
    // Left side: end
    if (normalized >= 135 && normalized < 225) {
        return 'end';
    }
    // Top and bottom: middle
    return 'middle';
}

/**
 * Get vertical offset for label based on angle
 * 
 * Returns dy value for SVG text element (in em units)
 */
export function getLabelDy(angle: number): string {
    const normalized = normalizeAngle(angle);

    // Top half (label below center line)
    if (normalized > 180 && normalized < 360) {
        return '-0.3em';
    }
    // Bottom half (label above center line)
    if (normalized > 0 && normalized < 180) {
        return '0.8em';
    }
    // Exactly horizontal
    return '0.35em';
}

// ============================================================================
// COLLISION RESOLUTION
// ============================================================================

/**
 * Check for label collisions and calculate adjustments
 * 
 * @param positions - Array of label positions
 * @param labelSizes - Array of label bounding box sizes
 * @param minDistance - Minimum distance between label centers
 * @returns Adjusted positions with no collisions
 */
export function resolveCollisions(
    positions: Point[],
    labelSizes: Array<{ width: number; height: number }>,
    minDistance: number = 5
): Point[] {
    // Create bounding boxes centered on positions
    const boxes: BoundingBox[] = positions.map((pos, i) => ({
        x: pos.x - labelSizes[i].width / 2,
        y: pos.y - labelSizes[i].height / 2,
        width: labelSizes[i].width,
        height: labelSizes[i].height,
    }));

    const adjustedPositions = [...positions];
    let hasCollisions = true;
    let iterations = 0;
    const maxIterations = 100;

    while (hasCollisions && iterations < maxIterations) {
        hasCollisions = false;
        iterations++;

        for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
                if (boxesOverlap(boxes[i], boxes[j])) {
                    hasCollisions = true;

                    // Calculate separation vector
                    const centerI = {
                        x: boxes[i].x + boxes[i].width / 2,
                        y: boxes[i].y + boxes[i].height / 2,
                    };
                    const centerJ = {
                        x: boxes[j].x + boxes[j].width / 2,
                        y: boxes[j].y + boxes[j].height / 2,
                    };

                    const dx = centerJ.x - centerI.x;
                    const dy = centerJ.y - centerI.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                    // Move both labels apart
                    const moveAmount = minDistance / 2;
                    const moveX = (dx / dist) * moveAmount;
                    const moveY = (dy / dist) * moveAmount;

                    adjustedPositions[i].x -= moveX;
                    adjustedPositions[i].y -= moveY;
                    adjustedPositions[j].x += moveX;
                    adjustedPositions[j].y += moveY;

                    // Update boxes
                    boxes[i].x = adjustedPositions[i].x - labelSizes[i].width / 2;
                    boxes[i].y = adjustedPositions[i].y - labelSizes[i].height / 2;
                    boxes[j].x = adjustedPositions[j].x - labelSizes[j].width / 2;
                    boxes[j].y = adjustedPositions[j].y - labelSizes[j].height / 2;
                }
            }
        }
    }

    return adjustedPositions;
}
