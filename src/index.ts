/**
 * Precision Overlay Engine - Main Entry Point
 * 
 * @module precision-overlay
 */

// Core exports
export {
    // Geometry
    type Point,
    type PolarCoord,
    type Direction,
    polarToCartesian,
    cartesianToPolar,
    calculateSegmentPositions,
    calculateSegmentLines,
    normalizeAngle,

    // SceneSpec
    type SceneSpec,
    type CircleSpec,
    type TextStyle,
    type Style,
    validateSpec,
    safeValidateSpec,
    isCircleSpec,
    generateLabelValues,

    // SVG Generation
    generateSVG,
    generateFullGroundTruth,
    generateLabelsOnlySVG,
} from './core/index.js';

// Render exports
export {
    renderSvgToPng,
    renderSvgToFile,
    saveSvgToFile,
    overlayOnImage,
} from './render/index.js';

// ============================================================================
// HIGH-LEVEL API
// ============================================================================

import { readFile } from 'fs/promises';
import { validateSpec, generateFullGroundTruth, type SceneSpec } from './core/index.js';
import { renderSvgToPng, renderSvgToFile, saveSvgToFile } from './render/index.js';

/**
 * Load and validate a SceneSpec from a JSON file
 */
export async function loadSpec(filePath: string): Promise<SceneSpec> {
    const content = await readFile(filePath, 'utf-8');
    const json = JSON.parse(content);
    return validateSpec(json);
}

/**
 * Render a SceneSpec to PNG buffer
 */
export async function render(spec: SceneSpec): Promise<Buffer> {
    const svg = generateFullGroundTruth(spec);
    const result = await renderSvgToPng(svg, {
        width: spec.output?.width,
        height: spec.output?.height,
    });
    return result.buffer;
}

/**
 * Render a SceneSpec to files
 */
export async function renderToFiles(
    spec: SceneSpec,
    outputPath: string
): Promise<{ svg?: string; png?: string }> {
    const svg = generateFullGroundTruth(spec);
    const format = spec.output?.format || 'both';
    const result: { svg?: string; png?: string } = {};

    const basePath = outputPath.replace(/\.(svg|png)$/, '');

    if (format === 'svg' || format === 'both') {
        const svgPath = `${basePath}.svg`;
        await saveSvgToFile(svg, svgPath);
        result.svg = svgPath;
    }

    if (format === 'png' || format === 'both') {
        const pngPath = `${basePath}.png`;
        await renderSvgToFile(svg, pngPath, {
            width: spec.output?.width,
            height: spec.output?.height,
        });
        result.png = pngPath;
    }

    return result;
}
