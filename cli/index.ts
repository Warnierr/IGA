#!/usr/bin/env node
/**
 * Precision Overlay CLI
 * 
 * Command-line interface for the Precision Overlay Engine.
 * 
 * @module cli
 */

import { Command } from 'commander';
import { resolve, dirname, basename } from 'path';
import { mkdir } from 'fs/promises';
import { loadSpec, renderToFiles, generateFullGroundTruth } from '../src/index.js';

const program = new Command();

program
    .name('precisio')
    .description('Precision Overlay Engine - Make T2I outputs mathematically exact')
    .version('0.1.0');

// ============================================================================
// RENDER COMMAND
// ============================================================================

program
    .command('render')
    .description('Render a SceneSpec to image')
    .requiredOption('-s, --spec <path>', 'Path to SceneSpec JSON file')
    .option('-o, --out <path>', 'Output path (without extension)', './out')
    .option('-f, --format <format>', 'Output format: svg, png, both', 'both')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
        try {
            const specPath = resolve(options.spec);
            const outPath = resolve(options.out);

            if (options.verbose) {
                console.log(`📄 Loading spec: ${specPath}`);
            }

            const spec = await loadSpec(specPath);

            // Override output format if specified
            if (options.format) {
                spec.output = { ...spec.output, format: options.format };
            }

            // Ensure output directory exists
            const outDir = dirname(outPath);
            await mkdir(outDir, { recursive: true });

            if (options.verbose) {
                console.log(`🎨 Rendering ${spec.type} with ${spec.segments?.count || 0} segments...`);
            }

            const result = await renderToFiles(spec, outPath);

            console.log('✅ Render complete:');
            if (result.svg) console.log(`   SVG: ${result.svg}`);
            if (result.png) console.log(`   PNG: ${result.png}`);

        } catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

// ============================================================================
// GROUND-TRUTH COMMAND
// ============================================================================

program
    .command('ground-truth')
    .description('Generate ground truth SVG only')
    .requiredOption('-s, --spec <path>', 'Path to SceneSpec JSON file')
    .option('-o, --out <path>', 'Output SVG path', './ground_truth.svg')
    .action(async (options) => {
        try {
            const specPath = resolve(options.spec);
            const outPath = resolve(options.out);

            const spec = await loadSpec(specPath);
            const svg = generateFullGroundTruth(spec);

            const { writeFile } = await import('fs/promises');
            await writeFile(outPath, svg, 'utf-8');

            console.log(`✅ Ground truth saved: ${outPath}`);

        } catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

// ============================================================================
// DEMO COMMAND
// ============================================================================

program
    .command('demo')
    .description('Run demo rendering all presets')
    .option('-o, --out-dir <path>', 'Output directory', './examples')
    .action(async (options) => {
        try {
            const { readdir } = await import('fs/promises');
            const specsDir = resolve('./specs');
            const outDir = resolve(options.outDir);

            console.log('🚀 Running demo with all presets...\n');

            const files = await readdir(specsDir);
            const jsonFiles = files.filter(f => f.endsWith('.json'));

            for (const file of jsonFiles) {
                const specPath = resolve(specsDir, file);
                const specName = basename(file, '.json');
                const outputDir = resolve(outDir, specName);

                await mkdir(outputDir, { recursive: true });

                console.log(`📐 Rendering ${specName}...`);
                const spec = await loadSpec(specPath);
                const result = await renderToFiles(spec, resolve(outputDir, 'out'));

                console.log(`   ✅ ${result.png || result.svg}`);
            }

            console.log('\n🎉 Demo complete!');

        } catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

// ============================================================================
// VERIFY COMMAND (stub for Milestone B)
// ============================================================================

program
    .command('verify')
    .description('Verify image against ground truth (coming in Milestone B)')
    .requiredOption('-i, --image <path>', 'Path to image to verify')
    .requiredOption('-s, --spec <path>', 'Path to SceneSpec JSON file')
    .option('-r, --report <path>', 'Path for JSON report')
    .action(async (options) => {
        console.log('⚠️  Verification not yet implemented (Milestone B)');
        console.log('   Will compare:', options.image);
        console.log('   Against spec:', options.spec);
        if (options.report) {
            console.log('   Report path:', options.report);
        }
    });

// Parse and run
program.parse();
