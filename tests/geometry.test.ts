/**
 * Geometry Module Tests
 * 
 * Tests for polar/cartesian conversions, segment calculations, and collision resolution.
 */

import { describe, it, expect } from 'vitest';
import {
    polarToCartesian,
    cartesianToPolar,
    normalizeAngle,
    calculateSegmentPositions,
    calculateAngleStep,
    getLabelAnchor,
    distance,
    type Point,
} from '../src/core/geometry.js';

describe('Geometry Module', () => {

    describe('normalizeAngle', () => {
        it('should keep angles in [0, 360) unchanged', () => {
            expect(normalizeAngle(0)).toBe(0);
            expect(normalizeAngle(90)).toBe(90);
            expect(normalizeAngle(180)).toBe(180);
            expect(normalizeAngle(270)).toBe(270);
        });

        it('should normalize negative angles', () => {
            expect(normalizeAngle(-90)).toBeCloseTo(270);
            expect(normalizeAngle(-180)).toBeCloseTo(180);
            expect(normalizeAngle(-360)).toBeCloseTo(0);
        });

        it('should normalize angles >= 360', () => {
            expect(normalizeAngle(360)).toBe(0);
            expect(normalizeAngle(450)).toBe(90);
            expect(normalizeAngle(720)).toBe(0);
        });
    });

    describe('polarToCartesian', () => {
        const center: Point = { x: 100, y: 100 };
        const radius = 50;

        it('should convert 0° to right of center', () => {
            const result = polarToCartesian(center, { radius, angle: 0 });
            expect(result.x).toBeCloseTo(150);
            expect(result.y).toBeCloseTo(100);
        });

        it('should convert 90° to below center (SVG coords)', () => {
            const result = polarToCartesian(center, { radius, angle: 90 });
            expect(result.x).toBeCloseTo(100);
            expect(result.y).toBeCloseTo(150);
        });

        it('should convert 180° to left of center', () => {
            const result = polarToCartesian(center, { radius, angle: 180 });
            expect(result.x).toBeCloseTo(50);
            expect(result.y).toBeCloseTo(100);
        });

        it('should convert 270° to above center', () => {
            const result = polarToCartesian(center, { radius, angle: 270 });
            expect(result.x).toBeCloseTo(100);
            expect(result.y).toBeCloseTo(50);
        });
    });

    describe('cartesianToPolar', () => {
        const center: Point = { x: 100, y: 100 };

        it('should convert point right of center to 0°', () => {
            const result = cartesianToPolar(center, { x: 150, y: 100 });
            expect(result.radius).toBeCloseTo(50);
            expect(result.angle).toBeCloseTo(0);
        });

        it('should convert point below center to 90°', () => {
            const result = cartesianToPolar(center, { x: 100, y: 150 });
            expect(result.radius).toBeCloseTo(50);
            expect(result.angle).toBeCloseTo(90);
        });
    });

    describe('calculateAngleStep', () => {
        it('should calculate 90° for 4 segments', () => {
            expect(calculateAngleStep(4)).toBe(90);
        });

        it('should calculate 30° for 12 segments', () => {
            expect(calculateAngleStep(12)).toBe(30);
        });

        it('should calculate 12° for 30 segments', () => {
            expect(calculateAngleStep(30)).toBe(12);
        });
    });

    describe('calculateSegmentPositions', () => {
        const center: Point = { x: 512, y: 512 };
        const radius = 400;

        it('should generate correct number of positions', () => {
            const positions4 = calculateSegmentPositions(center, radius, 4);
            expect(positions4).toHaveLength(4);

            const positions30 = calculateSegmentPositions(center, radius, 30);
            expect(positions30).toHaveLength(30);
        });

        it('should place first segment at startAngle', () => {
            const positions = calculateSegmentPositions(center, radius, 4, 0);
            // First position should be to the right (0°)
            expect(positions[0].x).toBeCloseTo(center.x + radius);
            expect(positions[0].y).toBeCloseTo(center.y);
        });

        it('should respect direction (CW vs CCW)', () => {
            const positionsCW = calculateSegmentPositions(center, radius, 4, 0, 'cw');
            const positionsCCW = calculateSegmentPositions(center, radius, 4, 0, 'ccw');

            // CW: second position should be at 90° (below center)
            expect(positionsCW[1].y).toBeGreaterThan(center.y);

            // CCW: second position should be at -90°/270° (above center)
            expect(positionsCCW[1].y).toBeLessThan(center.y);
        });

        it('should all be equidistant from center', () => {
            const positions = calculateSegmentPositions(center, radius, 30);

            for (const pos of positions) {
                const dist = distance(center, pos);
                expect(dist).toBeCloseTo(radius, 5);
            }
        });

        it('should space segments evenly', () => {
            const positions = calculateSegmentPositions(center, radius, 12);

            // Check distances between consecutive positions
            for (let i = 0; i < positions.length; i++) {
                const next = positions[(i + 1) % positions.length];
                const dist = distance(positions[i], next);
                // All arc lengths should be equal
                expect(dist).toBeCloseTo(distance(positions[0], positions[1]), 5);
            }
        });
    });

    describe('getLabelAnchor', () => {
        it('should return "start" for right side (0°, 315°-360°)', () => {
            expect(getLabelAnchor(0)).toBe('start');
            expect(getLabelAnchor(30)).toBe('start');
            expect(getLabelAnchor(330)).toBe('start');
        });

        it('should return "end" for left side (135°-225°)', () => {
            expect(getLabelAnchor(150)).toBe('end');
            expect(getLabelAnchor(180)).toBe('end');
            expect(getLabelAnchor(210)).toBe('end');
        });

        it('should return "middle" for top/bottom (45°-135°, 225°-315°)', () => {
            expect(getLabelAnchor(90)).toBe('middle');
            expect(getLabelAnchor(270)).toBe('middle');
        });
    });

    describe('distance', () => {
        it('should calculate distance correctly', () => {
            expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
            expect(distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
            expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
        });
    });

});
