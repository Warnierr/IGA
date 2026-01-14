/**
 * SVG Ground Truth Generator
 * 
 * Generates mathematically exact SVG representations from SceneSpecs.
 * These serve as the "ground truth" for verification.
 * 
 * @module core/svgGroundTruth
 */

import {
    type Point,
    calculateSegmentPositions,
    calculateSegmentLines,
    getLabelAnchor,
    getLabelDy,
    polarToCartesian,
    calculateHandAngles,
    calculateVennCentroids,
    circleIntersections,
    calculateIntersectionCentroid,
    calculateGridPositions,
    calculateSpiralPositions,
} from './geometry.js';
import {
    type SceneSpec,
    type CircleSpec,
    type ClockSpec,
    type VennSpec,
    type GridSpec,
    type SpiralSpec,
    type HandStyle,
    type TextStyle,
    type Style,
    isCircleSpec,
    isClockSpec,
    isVennSpec,
    isGridSpec,
    isSpiralSpec,
    generateLabelValues,
    applyDefaults,
    DEFAULT_TEXT_STYLE,
    DEFAULT_STYLE,
} from './sceneSpec.js';

// ============================================================================
// TYPES
// ============================================================================

export interface SVGGenerationOptions {
    includeBackground?: boolean;
    includeSegmentLines?: boolean;
    includeLabels?: boolean;
    xmlDeclaration?: boolean;
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate SVG string from a SceneSpec
 */
export function generateSVG(
    spec: SceneSpec,
    options: SVGGenerationOptions = {}
): string {
    const fullSpec = applyDefaults(spec);

    const {
        includeBackground = true,
        includeSegmentLines = true,
        includeLabels = true,
        xmlDeclaration = true,
    } = options;

    const output = fullSpec.output!;
    const style = fullSpec.style!;

    const parts: string[] = [];

    // XML declaration
    if (xmlDeclaration) {
        parts.push('<?xml version="1.0" encoding="UTF-8"?>');
    }

    // SVG root
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${output.width}" height="${output.height}" viewBox="0 0 ${output.width} ${output.height}">`);

    // Background
    if (includeBackground) {
        parts.push(`  <rect width="100%" height="100%" fill="${style.background}"/>`);
    }

    // Type-specific generation
    if (isCircleSpec(fullSpec)) {
        parts.push(...generateCircleSVG(fullSpec as CircleSpec, {
            includeSegmentLines,
            includeLabels,
        }));
    } else if (isClockSpec(fullSpec)) {
        parts.push(...generateClockSVG(fullSpec as ClockSpec, {
            includeSegmentLines,
            includeLabels,
        }));
    } else if (isVennSpec(fullSpec)) {
        parts.push(...generateVennSVG(fullSpec as VennSpec, {
            includeLabels,
        }));
    } else if (isGridSpec(fullSpec)) {
        parts.push(...generateGridSVG(fullSpec as GridSpec, {
            includeLabels,
        }));
    } else if (isSpiralSpec(fullSpec)) {
        parts.push(...generateSpiralSVG(fullSpec as SpiralSpec, {
            includeLabels,
        }));
    }

    parts.push('</svg>');

    return parts.join('\n');
}

// ============================================================================
// CIRCLE GENERATOR
// ============================================================================

function generateCircleSVG(
    spec: CircleSpec,
    options: { includeSegmentLines: boolean; includeLabels: boolean }
): string[] {
    const parts: string[] = [];
    const { geometry, segments, labels, style = DEFAULT_STYLE } = spec;
    const center = geometry.center;
    const radius = geometry.radius;

    // Main circle
    parts.push(`  <!-- Main Circle -->`);
    parts.push(`  <circle cx="${center.x}" cy="${center.y}" r="${radius}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}" fill="${style.fill}"/>`);

    // Segment lines
    if (options.includeSegmentLines && segments) {
        parts.push(`  <!-- Segment Lines -->`);
        parts.push(`  <g id="segment-lines" stroke="${style.stroke}" stroke-width="1" opacity="0.3">`);

        const lines = calculateSegmentLines(
            center,
            0, // from center
            radius,
            segments.count,
            segments.startAngle,
            segments.direction
        );

        for (const line of lines) {
            parts.push(`    <line x1="${line.start.x.toFixed(2)}" y1="${line.start.y.toFixed(2)}" x2="${line.end.x.toFixed(2)}" y2="${line.end.y.toFixed(2)}"/>`);
        }

        parts.push(`  </g>`);
    }

    // Labels
    if (options.includeLabels && labels && segments) {
        const labelStyle = { ...DEFAULT_TEXT_STYLE, ...labels.style };
        const labelRadius = radius * (labels.offsetRadius || 1.1);

        const positions = calculateSegmentPositions(
            center,
            labelRadius,
            segments.count,
            segments.startAngle,
            segments.direction
        );

        const labelValues = generateLabelValues(labels, segments.count);

        parts.push(`  <!-- Labels -->`);
        parts.push(`  <g id="labels" font-family="${labelStyle.fontFamily}" font-size="${labelStyle.fontSize}" font-weight="${labelStyle.fontWeight}" fill="${labelStyle.fill}">`);

        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const value = labelValues[i];

            // Calculate angle for this position to determine anchor
            const angleStep = 360 / segments.count;
            const dirMultiplier = segments.direction === 'cw' ? 1 : -1;
            const angle = segments.startAngle + i * angleStep * dirMultiplier;

            const anchor = getLabelAnchor(angle);
            const dy = getLabelDy(angle);

            parts.push(`    <text x="${pos.x.toFixed(2)}" y="${pos.y.toFixed(2)}" text-anchor="${anchor}" dy="${dy}">${escapeXml(value)}</text>`);
        }

        parts.push(`  </g>`);
    }

    return parts;
}

// ============================================================================
// CLOCK GENERATOR
// ============================================================================

function generateClockSVG(
    spec: ClockSpec,
    options: { includeSegmentLines: boolean; includeLabels: boolean }
): string[] {
    const parts: string[] = [];
    const { geometry, clock, segments, labels, style = DEFAULT_STYLE } = spec;
    const center = geometry.center;
    const radius = geometry.radius;

    // Main circle
    parts.push(`  <!-- Clock Face -->`);
    parts.push(`  <circle cx="${center.x}" cy="${center.y}" r="${radius}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}" fill="${style.fill}"/>`);

    // Hour markers (if segments provided)
    if (options.includeSegmentLines && segments) {
        parts.push(`  <!-- Hour Markers -->`);
        parts.push(`  <g id="hour-markers" stroke="${style.stroke}" stroke-width="3" opacity="0.6">`);

        const lines = calculateSegmentLines(
            center,
            radius * 0.9, // from 90% radius
            radius,
            segments.count,
            segments.startAngle,
            segments.direction
        );

        for (const line of lines) {
            parts.push(`    <line x1="${line.start.x.toFixed(2)}" y1="${line.start.y.toFixed(2)}" x2="${line.end.x.toFixed(2)}" y2="${line.end.y.toFixed(2)}"/>`);
        }

        parts.push(`  </g>`);
    }

    // Hour labels
    if (options.includeLabels && labels && segments) {
        const labelStyle = { ...DEFAULT_TEXT_STYLE, ...labels.style };
        const labelRadius = radius * (labels.offsetRadius || 0.75); // Inside the clock

        const positions = calculateSegmentPositions(
            center,
            labelRadius,
            segments.count,
            segments.startAngle,
            segments.direction
        );

        const labelValues = generateLabelValues(labels, segments.count);

        parts.push(`  <!-- Hour Labels -->`);
        parts.push(`  <g id="hour-labels" font-family="${labelStyle.fontFamily}" font-size="${labelStyle.fontSize}" font-weight="${labelStyle.fontWeight}" fill="${labelStyle.fill}">`);

        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const value = labelValues[i];
            parts.push(`    <text x="${pos.x.toFixed(2)}" y="${pos.y.toFixed(2)}" text-anchor="middle" dy="0.35em">${escapeXml(value)}</text>`);
        }

        parts.push(`  </g>`);
    }

    // Clock hands
    if (clock) {
        const angles = calculateHandAngles(clock.time);
        const defaultHandStyle: HandStyle = { width: 10, length: 0.7, color: '#000000', shape: 'line' };

        parts.push(`  <!-- Clock Hands -->`);
        parts.push(`  <g id="hands">`);

        // Hour hand
        if (clock.hands?.hour !== undefined || true) {
            const handStyle = { ...defaultHandStyle, ...clock.hands?.hour, width: 15, length: 0.5 };
            const handEnd = polarToCartesian(center, { radius: radius * handStyle.length, angle: angles.hour });
            parts.push(`    <!-- Hour Hand -->`);
            parts.push(`    <line x1="${center.x}" y1="${center.y}" x2="${handEnd.x.toFixed(2)}" y2="${handEnd.y.toFixed(2)}" stroke="${handStyle.color}" stroke-width="${handStyle.width}" stroke-linecap="round"/>`);
        }

        // Minute hand
        if (clock.hands?.minute !== undefined || true) {
            const handStyle = { ...defaultHandStyle, ...clock.hands?.minute, width: 10, length: 0.75 };
            const handEnd = polarToCartesian(center, { radius: radius * handStyle.length, angle: angles.minute });
            parts.push(`    <!-- Minute Hand -->`);
            parts.push(`    <line x1="${center.x}" y1="${center.y}" x2="${handEnd.x.toFixed(2)}" y2="${handEnd.y.toFixed(2)}" stroke="${handStyle.color}" stroke-width="${handStyle.width}" stroke-linecap="round"/>`);
        }

        // Second hand
        if (clock.hands?.second !== undefined) {
            const handStyle = { ...defaultHandStyle, ...clock.hands.second, width: 4, length: 0.85, color: '#e74c3c' };
            const handEnd = polarToCartesian(center, { radius: radius * handStyle.length, angle: angles.second });
            parts.push(`    <!-- Second Hand -->`);
            parts.push(`    <line x1="${center.x}" y1="${center.y}" x2="${handEnd.x.toFixed(2)}" y2="${handEnd.y.toFixed(2)}" stroke="${handStyle.color}" stroke-width="${handStyle.width}" stroke-linecap="round"/>`);
        }

        // Center dot
        parts.push(`    <!-- Center Dot -->`);
        parts.push(`    <circle cx="${center.x}" cy="${center.y}" r="10" fill="#000"/>`);

        parts.push(`  </g>`);
    }

    return parts;
}

// ============================================================================
// VENN DIAGRAM GENERATOR
// ============================================================================

function generateVennSVG(
    spec: VennSpec,
    options: { includeLabels: boolean }
): string[] {
    const parts: string[] = [];
    const { geometry, venn, style = DEFAULT_STYLE } = spec;
    const center = geometry.center;
    const radius = geometry.radius;

    // Calculate circle centers
    const centroids = calculateVennCentroids(center, radius);
    const sets = venn.sets;

    // Default colors if not provided
    const defaultColors = [
        'rgba(52, 152, 219, 0.3)',  // Blue
        'rgba(231, 76, 60, 0.3)',   // Red
        'rgba(46, 204, 113, 0.3)',  // Green
    ];

    parts.push(`  <!-- Venn Diagram: ${sets.join(', ')} -->`);

    // Draw circles with fills
    parts.push(`  <g id="venn-circles">`);
    for (let i = 0; i < 3; i++) {
        const c = centroids[i];
        const color = venn.setColors?.[sets[i]] || defaultColors[i];
        parts.push(`    <!-- ${sets[i]} -->`);
        parts.push(`    <circle cx="${c.x.toFixed(2)}" cy="${c.y.toFixed(2)}" r="${radius}" fill="${color}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"/>`);
    }
    parts.push(`  </g>`);

    // Add labels if requested
    if (options.includeLabels) {
        parts.push(`  <!-- Labels -->`);
        parts.push(`  <g id="venn-labels" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#2c3e50">`);

        // Label for each individual set (outside the overlaps)
        for (let i = 0; i < 3; i++) {
            const c = centroids[i];
            // Position label opposite to center
            const angle = Math.atan2(c.y - center.y, c.x - center.x) * (180 / Math.PI);
            const labelPos = polarToCartesian(c, { radius: radius * 0.5, angle });

            parts.push(`    <text x="${labelPos.x.toFixed(2)}" y="${labelPos.y.toFixed(2)}" text-anchor="middle" dy="0.35em">`);
            parts.push(`      ${escapeXml(sets[i])}`);
            parts.push(`    </text>`);
        }

        // Labels for pairwise overlaps
        const pairs = [
            [0, 1], // sets[0] ∩ sets[1]
            [1, 2], // sets[1] ∩ sets[2]
            [0, 2], // sets[0] ∩ sets[2]
        ];

        for (const [i, j] of pairs) {
            const key = `${sets[i]},${sets[j]}`;
            const reverseKey = `${sets[j]},${sets[i]}`;
            const label = venn.overlaps[key] || venn.overlaps[reverseKey];

            if (label) {
                // Find intersection points
                const intersections = circleIntersections(centroids[i], radius, centroids[j], radius);

                if (intersections.length >= 2) {
                    // Place label at midpoint of intersection arc
                    const midpoint = calculateIntersectionCentroid(intersections);

                    parts.push(`    <text x="${midpoint.x.toFixed(2)}" y="${midpoint.y.toFixed(2)}" text-anchor="middle" dy="0.35em" font-size="14">`);
                    parts.push(`      ${escapeXml(label)}`);
                    parts.push(`    </text>`);
                }
            }
        }

        // Label for triple intersection (center)
        const centerKey = `${sets[0]},${sets[1]},${sets[2]}`;
        const centerLabel = venn.overlaps[centerKey];

        if (centerLabel) {
            parts.push(`    <text x="${center.x}" y="${center.y}" text-anchor="middle" dy="0.35em" font-size="18" font-weight="bold">`);
            parts.push(`      ${escapeXml(centerLabel)}`);
            parts.push(`    </text>`);
        }

        parts.push(`  </g>`);
    }

    return parts;
}

// ============================================================================
// GRID GENERATOR
// ============================================================================

function generateGridSVG(
    spec: GridSpec,
    options: { includeLabels: boolean }
): string[] {
    const parts: string[] = [];
    const { geometry, grid, style = DEFAULT_STYLE } = spec;
    const width = geometry.width;
    const height = geometry.height;

    // Calculate cell dimensions
    const cellWidth = grid.cellWidth || (width - (grid.cols - 1) * grid.spacing) / grid.cols;
    const cellHeight = grid.cellHeight || (height - (grid.rows - 1) * grid.spacing) / grid.rows;

    // Calculate top-left corner (centered if center is provided)
    const center = geometry.center || { x: width / 2, y: height / 2 };
    const topLeft = {
        x: center.x - width / 2,
        y: center.y - height / 2,
    };

    // Calculate grid positions
    const positions = calculateGridPositions(
        topLeft,
        grid.rows,
        grid.cols,
        cellWidth,
        cellHeight,
        grid.spacing
    );

    const itemCount = grid.rows * grid.cols;

    parts.push(`  <!-- Grid: ${grid.rows}×${grid.cols} -->`);

    // Draw cells
    parts.push(`  <g id="grid-cells">`);
    for (let i = 0; i < itemCount; i++) {
        const row = Math.floor(i / grid.cols);
        const col = i % grid.cols;
        const x = topLeft.x + col * (cellWidth + grid.spacing);
        const y = topLeft.y + row * (cellHeight + grid.spacing);

        parts.push(`    <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellWidth.toFixed(2)}" height="${cellHeight.toFixed(2)}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}" fill="${style.fill}"/>`);
    }
    parts.push(`  </g>`);

    // Add labels if provided
    if (options.includeLabels && grid.items) {
        parts.push(`  <!-- Grid Labels -->`);
        parts.push(`  <g id="grid-labels" font-family="Arial, sans-serif" font-size="16" font-weight="normal" fill="#2c3e50">`);

        const itemsToRender = Math.min(grid.items.length, itemCount);
        for (let i = 0; i < itemsToRender; i++) {
            const pos = positions[i];
            const item = grid.items[i];

            parts.push(`    <text x="${pos.x.toFixed(2)}" y="${pos.y.toFixed(2)}" text-anchor="middle" dy="0.35em">`);
            parts.push(`      ${escapeXml(item.label)}`);
            parts.push(`    </text>`);
        }

        parts.push(`  </g>`);
    }

    return parts;
}

// ============================================================================
// SPIRAL GENERATOR
// ============================================================================

function generateSpiralSVG(
    spec: SpiralSpec,
    options: { includeLabels: boolean }
): string[] {
    const parts: string[] = [];
    const { geometry, spiral, style = DEFAULT_STYLE } = spec;

    // Calculate spiral positions
    const positions = calculateSpiralPositions(
        geometry.center,
        spiral.count,
        spiral.type,
        spiral.a,
        spiral.b,
        spiral.startAngle,
        spiral.turns
    );

    parts.push(`  <!-- Spiral: ${spiral.type} (${spiral.count} items) -->`);

    // Draw spiral path (guide line)
    // To make it smooth, we calculate more points for the line
    const guidePoints = calculateSpiralPositions(
        geometry.center,
        100 * spiral.turns, // Higher resolution for smooth curve
        spiral.type,
        spiral.a,
        spiral.b,
        spiral.startAngle,
        spiral.turns
    );

    // Convert points to path data
    if (guidePoints.length > 0) {
        const d = `M ${guidePoints[0].x.toFixed(2)} ${guidePoints[0].y.toFixed(2)} ` +
            guidePoints.slice(1).map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

        parts.push(`  <path d="${d}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}" fill="none" opacity="0.5"/>`);
    }

    // Add items/labels
    if (spiral.items) {
        parts.push(`  <g id="spiral-items" font-family="Arial, sans-serif" font-size="16" font-weight="normal" fill="#2c3e50">`);

        const itemsToRender = Math.min(spiral.items.length, spiral.count);
        for (let i = 0; i < itemsToRender; i++) {
            const pos = positions[i];
            const item = spiral.items[i];

            // If rotation is enabled, calculate tangent angle
            let transform = '';
            if (item.rotation) {
                // Approximate tangent using next point (or previous for last point)
                const nextPos = (i < positions.length - 1) ? positions[i + 1] : pos;
                const prevPos = (i > 0) ? positions[i - 1] : pos;

                let angle = 0;
                if (i < positions.length - 1) {
                    angle = Math.atan2(nextPos.y - pos.y, nextPos.x - pos.x) * 180 / Math.PI;
                } else {
                    angle = Math.atan2(pos.y - prevPos.y, pos.x - prevPos.x) * 180 / Math.PI;
                }

                transform = ` transform="rotate(${angle.toFixed(2)} ${pos.x.toFixed(2)} ${pos.y.toFixed(2)})"`;
            }

            parts.push(`    <text x="${pos.x.toFixed(2)}" y="${pos.y.toFixed(2)}" text-anchor="middle" dy="0.35em"${transform}>`);
            parts.push(`      ${escapeXml(item.label)}`);
            parts.push(`    </text>`);
        }

        parts.push(`  </g>`);
    } else {
        // Draw points if no items defined
        parts.push(`  <g id="spiral-points">`);
        for (const pos of positions) {
            parts.push(`    <circle cx="${pos.x.toFixed(2)}" cy="${pos.y.toFixed(2)}" r="4" fill="${style.stroke}"/>`);
        }
        parts.push(`  </g>`);
    }

    return parts;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Format number for SVG (max 2 decimal places)
 */
function formatNum(n: number): string {
    return n.toFixed(2).replace(/\.?0+$/, '');
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

/**
 * Generate SVG with all options enabled (full ground truth)
 */
export function generateFullGroundTruth(spec: SceneSpec): string {
    return generateSVG(spec, {
        includeBackground: true,
        includeSegmentLines: true,
        includeLabels: true,
        xmlDeclaration: true,
    });
}

/**
 * Generate minimal SVG (labels only, no background)
 */
export function generateLabelsOnlySVG(spec: SceneSpec): string {
    return generateSVG(spec, {
        includeBackground: false,
        includeSegmentLines: false,
        includeLabels: true,
        xmlDeclaration: false,
    });
}
