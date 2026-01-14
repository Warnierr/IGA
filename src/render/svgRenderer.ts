/**
 * SVG Renderer Module
 * 
 * Converts SVG to PNG using Sharp library.
 * 
 * @module render/svgRenderer
 */

import sharp from 'sharp';

// ============================================================================
// TYPES
// ============================================================================

export interface RenderOptions {
    width?: number;
    height?: number;
    density?: number; // DPI for rasterization
    background?: string;
}

export interface RenderResult {
    buffer: Buffer;
    width: number;
    height: number;
    format: 'png';
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

/**
 * Render SVG string to PNG buffer
 * 
 * @param svgString - SVG content as string
 * @param options - Render options
 * @returns PNG buffer and metadata
 */
export async function renderSvgToPng(
    svgString: string,
    options: RenderOptions = {}
): Promise<RenderResult> {
    const {
        width,
        height,
        density = 96,
        background,
    } = options;

    const svgBuffer = Buffer.from(svgString);

    let pipeline = sharp(svgBuffer, { density });

    // Resize if dimensions specified
    if (width || height) {
        pipeline = pipeline.resize(width, height, {
            fit: 'contain',
            background: background || { r: 255, g: 255, b: 255, alpha: 1 },
        });
    }

    // Add background if specified
    if (background) {
        pipeline = pipeline.flatten({ background });
    }

    const pngBuffer = await pipeline.png().toBuffer();
    const metadata = await sharp(pngBuffer).metadata();

    return {
        buffer: pngBuffer,
        width: metadata.width!,
        height: metadata.height!,
        format: 'png',
    };
}

/**
 * Render SVG string to file
 * 
 * @param svgString - SVG content as string
 * @param outputPath - Path to save PNG
 * @param options - Render options
 */
export async function renderSvgToFile(
    svgString: string,
    outputPath: string,
    options: RenderOptions = {}
): Promise<void> {
    const { buffer } = await renderSvgToPng(svgString, options);
    await sharp(buffer).toFile(outputPath);
}

/**
 * Save SVG string to file
 */
export async function saveSvgToFile(
    svgString: string,
    outputPath: string
): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(outputPath, svgString, 'utf-8');
}

// ============================================================================
// COMPOSITE OPERATIONS
// ============================================================================

/**
 * Overlay SVG on top of an existing image
 * 
 * @param baseImagePath - Path to base image
 * @param overlaySvg - SVG string to overlay
 * @param outputPath - Path to save result
 */
export async function overlayOnImage(
    baseImagePath: string,
    overlaySvg: string,
    outputPath: string
): Promise<void> {
    const baseImage = sharp(baseImagePath);
    const metadata = await baseImage.metadata();

    // Render overlay SVG at same size as base
    const { buffer: overlayBuffer } = await renderSvgToPng(overlaySvg, {
        width: metadata.width,
        height: metadata.height,
    });

    // Composite overlay on base
    await baseImage
        .composite([{
            input: overlayBuffer,
            blend: 'over',
        }])
        .toFile(outputPath);
}
