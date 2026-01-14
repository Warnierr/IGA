/**
 * SVG Ground Truth Tests
 * 
 * Tests for SVG generation from SceneSpecs.
 */

import { describe, it, expect } from 'vitest';
import { generateSVG, generateFullGroundTruth } from '../src/core/svgGroundTruth.js';
import { validateSpec } from '../src/core/sceneSpec.js';

describe('SVG Ground Truth Module', () => {

    const circle30Spec = validateSpec({
        type: 'circle',
        id: 'circle30',
        geometry: {
            center: { x: 512, y: 512 },
            radius: 400,
        },
        segments: {
            count: 30,
            startAngle: 0,
            direction: 'cw',
        },
        labels: {
            values: 'numeric',
            placement: 'outside',
            offsetRadius: 1.1,
        },
        style: {
            stroke: '#000000',
            strokeWidth: 2,
            fill: 'none',
            background: '#ffffff',
        },
        output: {
            width: 1024,
            height: 1024,
            format: 'both',
        },
    });

    describe('generateSVG', () => {
        it('should generate valid SVG with XML declaration', () => {
            const svg = generateSVG(circle30Spec);

            expect(svg).toContain('<?xml version="1.0"');
            expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
            expect(svg).toContain('</svg>');
        });

        it('should include background rect', () => {
            const svg = generateSVG(circle30Spec);

            expect(svg).toContain('<rect width="100%" height="100%"');
            expect(svg).toContain('fill="#ffffff"');
        });

        it('should include main circle', () => {
            const svg = generateSVG(circle30Spec);

            expect(svg).toContain('<circle');
            expect(svg).toContain('cx="512"');
            expect(svg).toContain('cy="512"');
            expect(svg).toContain('r="400"');
        });

        it('should include 30 labels', () => {
            const svg = generateSVG(circle30Spec);

            // Count <text> elements
            const textMatches = svg.match(/<text/g);
            expect(textMatches).toHaveLength(30);
        });

        it('should include labels 1 through 30', () => {
            const svg = generateSVG(circle30Spec);

            for (let i = 1; i <= 30; i++) {
                expect(svg).toContain(`>${i}</text>`);
            }
        });

        it('should include segment lines', () => {
            const svg = generateSVG(circle30Spec);

            expect(svg).toContain('id="segment-lines"');
            const lineMatches = svg.match(/<line/g);
            expect(lineMatches).toHaveLength(30);
        });

        it('should respect includeLabels option', () => {
            const svg = generateSVG(circle30Spec, { includeLabels: false });

            expect(svg).not.toContain('id="labels"');
            expect(svg).not.toContain('<text');
        });

        it('should respect includeSegmentLines option', () => {
            const svg = generateSVG(circle30Spec, { includeSegmentLines: false });

            expect(svg).not.toContain('id="segment-lines"');
            expect(svg).not.toContain('<line');
        });

        it('should respect includeBackground option', () => {
            const svg = generateSVG(circle30Spec, { includeBackground: false });

            expect(svg).not.toContain('<rect width="100%"');
        });

        it('should omit XML declaration when requested', () => {
            const svg = generateSVG(circle30Spec, { xmlDeclaration: false });

            expect(svg).not.toContain('<?xml');
            expect(svg).toMatch(/^<svg/);
        });
    });

    describe('generateFullGroundTruth', () => {
        it('should include all elements', () => {
            const svg = generateFullGroundTruth(circle30Spec);

            expect(svg).toContain('<?xml');
            expect(svg).toContain('<rect');
            expect(svg).toContain('<circle');
            expect(svg).toContain('id="segment-lines"');
            expect(svg).toContain('id="labels"');
        });
    });

    describe('Clock12 Spec', () => {
        const clock12Spec = validateSpec({
            type: 'circle',
            id: 'clock12',
            geometry: {
                center: { x: 512, y: 512 },
                radius: 400,
            },
            segments: {
                count: 12,
                startAngle: -90, // 12 at top
                direction: 'cw',
            },
            labels: {
                values: ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
                placement: 'outside',
            },
        });

        it('should generate 12 labels', () => {
            const svg = generateSVG(clock12Spec);

            const textMatches = svg.match(/<text/g);
            expect(textMatches).toHaveLength(12);
        });

        it('should include custom label values', () => {
            const svg = generateSVG(clock12Spec);

            expect(svg).toContain('>12</text>');
            expect(svg).toContain('>1</text>');
            expect(svg).toContain('>11</text>');
        });
    });

});
