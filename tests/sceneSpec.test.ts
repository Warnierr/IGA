/**
 * SceneSpec Module Tests
 * 
 * Tests for spec validation and label generation.
 */

import { describe, it, expect } from 'vitest';
import {
    validateSpec,
    safeValidateSpec,
    isCircleSpec,
    generateLabelValues,
    applyDefaults,
    type SceneSpec,
    type Labels,
} from '../src/core/sceneSpec.js';

describe('SceneSpec Module', () => {

    describe('validateSpec', () => {
        it('should validate a valid circle spec', () => {
            const spec = {
                type: 'circle',
                id: 'test-circle',
                geometry: {
                    center: { x: 512, y: 512 },
                    radius: 400,
                },
                segments: {
                    count: 30,
                },
            };

            const result = validateSpec(spec);
            expect(result.type).toBe('circle');
            expect(result.id).toBe('test-circle');
        });

        it('should apply defaults', () => {
            const spec = {
                type: 'circle',
                id: 'test',
                geometry: { center: { x: 0, y: 0 }, radius: 100 },
                segments: { count: 4 },
            };

            const result = validateSpec(spec);
            expect(result.segments?.direction).toBe('cw');
            expect(result.segments?.startAngle).toBe(0);
        });

        it('should reject invalid type', () => {
            const spec = {
                type: 'invalid',
                id: 'test',
                geometry: {},
            };

            expect(() => validateSpec(spec)).toThrow();
        });

        it('should reject negative radius', () => {
            const spec = {
                type: 'circle',
                id: 'test',
                geometry: { center: { x: 0, y: 0 }, radius: -100 },
            };

            expect(() => validateSpec(spec)).toThrow();
        });
    });

    describe('safeValidateSpec', () => {
        it('should return success:true for valid spec', () => {
            const result = safeValidateSpec({
                type: 'circle',
                id: 'test',
                geometry: { center: { x: 0, y: 0 }, radius: 100 },
            });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it('should return success:false for invalid spec', () => {
            const result = safeValidateSpec({
                type: 'invalid',
                id: 'test',
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('isCircleSpec', () => {
        it('should return true for circle type', () => {
            const spec: SceneSpec = {
                type: 'circle',
                id: 'test',
                geometry: { center: { x: 0, y: 0 }, radius: 100 },
            };

            expect(isCircleSpec(spec)).toBe(true);
        });

        it('should return false for other types', () => {
            const spec: SceneSpec = {
                type: 'grid',
                id: 'test',
                geometry: {},
            };

            expect(isCircleSpec(spec)).toBe(false);
        });
    });

    describe('generateLabelValues', () => {
        it('should generate numeric labels', () => {
            const labels: Labels = { values: 'numeric', placement: 'outside' };
            const result = generateLabelValues(labels, 5);

            expect(result).toEqual(['1', '2', '3', '4', '5']);
        });

        it('should generate alpha labels', () => {
            const labels: Labels = { values: 'alpha', placement: 'outside' };
            const result = generateLabelValues(labels, 5);

            expect(result).toEqual(['A', 'B', 'C', 'D', 'E']);
        });

        it('should generate roman numeral labels', () => {
            const labels: Labels = { values: 'roman', placement: 'outside' };
            const result = generateLabelValues(labels, 5);

            expect(result).toEqual(['I', 'II', 'III', 'IV', 'V']);
        });

        it('should use custom array values', () => {
            const labels: Labels = { values: ['A', 'B', 'C'], placement: 'outside' };
            const result = generateLabelValues(labels, 3);

            expect(result).toEqual(['A', 'B', 'C']);
        });

        it('should cycle custom array if shorter than count', () => {
            const labels: Labels = { values: ['X', 'Y'], placement: 'outside' };
            const result = generateLabelValues(labels, 4);

            expect(result).toEqual(['X', 'Y', 'X', 'Y']);
        });
    });

    describe('applyDefaults', () => {
        it('should add default style', () => {
            const spec: SceneSpec = {
                type: 'circle',
                id: 'test',
                geometry: {},
            };

            const result = applyDefaults(spec);
            expect(result.style?.stroke).toBe('#000000');
            expect(result.style?.background).toBe('#ffffff');
        });

        it('should add default output', () => {
            const spec: SceneSpec = {
                type: 'circle',
                id: 'test',
                geometry: {},
            };

            const result = applyDefaults(spec);
            expect(result.output?.width).toBe(1024);
            expect(result.output?.height).toBe(1024);
            expect(result.output?.format).toBe('both');
        });

        it('should not override existing values', () => {
            const spec: SceneSpec = {
                type: 'circle',
                id: 'test',
                geometry: {},
                style: { stroke: '#ff0000', strokeWidth: 1, fill: 'none', background: '#000' },
            };

            const result = applyDefaults(spec);
            expect(result.style?.stroke).toBe('#ff0000');
        });
    });

});
