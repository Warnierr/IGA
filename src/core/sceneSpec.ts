/**
 * SceneSpec Module - Scene specification types and validation
 * 
 * Defines the JSON schema for scene specifications and provides
 * validation using Zod.
 * 
 * @module core/sceneSpec
 */

import { z } from 'zod';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const PointSchema = z.object({
    x: z.number(),
    y: z.number(),
});

export const TextStyleSchema = z.object({
    fontFamily: z.string().default('Arial, sans-serif'),
    fontSize: z.number().default(16),
    fontWeight: z.enum(['normal', 'bold', 'lighter']).default('normal'),
    fill: z.string().default('#000000'),
});

export const StyleSchema = z.object({
    stroke: z.string().default('#000000'),
    strokeWidth: z.number().default(1),
    fill: z.string().default('none'),
    background: z.string().default('#ffffff'),
});

export const OutputSchema = z.object({
    width: z.number().default(1024),
    height: z.number().default(1024),
    format: z.enum(['svg', 'png', 'both']).default('both'),
});

export const GeometrySchema = z.object({
    center: PointSchema.optional(),
    radius: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
});

export const SegmentsSchema = z.object({
    count: z.number().int().min(1),
    startAngle: z.number().default(0),
    direction: z.enum(['cw', 'ccw']).default('cw'),
});

export const LabelsSchema = z.object({
    values: z.union([
        z.array(z.string()),
        z.enum(['numeric', 'alpha', 'roman']),
    ]),
    style: TextStyleSchema.optional(),
    placement: z.enum(['inside', 'outside', 'on-line']).default('outside'),
    offsetRadius: z.number().default(1.1),
});

export const HandStyleSchema = z.object({
    width: z.number().default(10),
    length: z.number().default(0.7), // as fraction of radius
    color: z.string().default('#000000'),
    shape: z.enum(['line', 'arrow', 'tapered']).default('line'),
});

export const ClockSchema = z.object({
    time: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
    hands: z.object({
        hour: HandStyleSchema.optional(),
        minute: HandStyleSchema.optional(),
        second: HandStyleSchema.optional(),
    }).optional(),
});

export const VennSchema = z.object({
    sets: z.array(z.string()).length(3), // Exactly 3 sets for now
    setColors: z.record(z.string()).optional(), // { "Set A": "rgba(...)" }
    overlaps: z.record(z.string()), // { "A,B": "Label" }
});

export const GridSchema = z.object({
    rows: z.number().int().min(1),
    cols: z.number().int().min(1),
    cellWidth: z.number().min(0).optional(),
    cellHeight: z.number().min(0).optional(),
    spacing: z.number().min(0).default(10),
    items: z.array(z.object({
        label: z.string(),
        style: z.record(z.any()).optional(),
    })).optional(),
});

export const SpiralSchema = z.object({
    type: z.enum(['archimedean', 'logarithmic']).default('archimedean'),
    count: z.number().int().min(1),
    a: z.number().default(0), // start radius
    b: z.number().default(20), // growth factor (gap for archimedean)
    startAngle: z.number().default(0),
    turns: z.number().default(2),
    items: z.array(z.object({
        label: z.string(),
        rotation: z.boolean().default(false), // align with tangent
    })).optional(),
});

export const MandalaSchema = z.object({
    axes: z.number().int().min(3).default(12), // Number of symmetry axes
    startAngle: z.number().default(0),
    layers: z.array(z.object({
        radius: z.number(), // Distance from center
        size: z.number().default(10), // Size of element
        count: z.number().optional(), // If defined, can differ from axes count
        label: z.string().optional(), // Fixed label (emoji/symbol)
        labels: LabelsSchema.optional(), // Dynamic labels (numeric, alpha, etc)
        rotation: z.boolean().default(true), // Rotate with the axis?
        offsetRotate: z.number().default(0), // Additional rotation
    })),
});

export const SceneSpecSchema = z.object({
    type: z.enum(['circle', 'grid', 'axis', 'compass', 'radar', 'timeline', 'clock', 'venn', 'spiral', 'mandala']),
    id: z.string(),
    geometry: GeometrySchema,
    segments: SegmentsSchema.optional(),
    labels: LabelsSchema.optional(),
    clock: ClockSchema.optional(),
    venn: VennSchema.optional(),
    grid: GridSchema.optional(),
    spiral: SpiralSchema.optional(),
    mandala: MandalaSchema.optional(),
    style: StyleSchema.optional(),
    output: OutputSchema.optional(),
});

// ============================================================================
// TYPES (inferred from Zod schemas)
// ============================================================================

export type Point = z.infer<typeof PointSchema>;
export type TextStyle = z.infer<typeof TextStyleSchema>;
export type Style = z.infer<typeof StyleSchema>;
export type Output = z.infer<typeof OutputSchema>;
export type Geometry = z.infer<typeof GeometrySchema>;
export type Segments = z.infer<typeof SegmentsSchema>;
export type Labels = z.infer<typeof LabelsSchema>;
export type HandStyle = z.infer<typeof HandStyleSchema>;
export type Clock = z.infer<typeof ClockSchema>;
export type Venn = z.infer<typeof VennSchema>;
export type Grid = z.infer<typeof GridSchema>;
export type Spiral = z.infer<typeof SpiralSchema>;
export type Mandala = z.infer<typeof MandalaSchema>;
export type SceneSpec = z.infer<typeof SceneSpecSchema>;

// ============================================================================
// SCENE TYPE DISCRIMINATORS
// ============================================================================

export type SceneType = SceneSpec['type'];

export interface CircleSpec extends SceneSpec {
    type: 'circle';
    geometry: {
        center: Point;
        radius: number;
    };
    segments: Segments;
}

export interface ClockSpec extends SceneSpec {
    type: 'clock';
    geometry: {
        center: Point;
        radius: number;
    };
    clock: Clock;
    segments?: Segments; // for hour markers
}

export interface VennSpec extends SceneSpec {
    type: 'venn';
    geometry: {
        center: Point;
        radius: number; // radius of each circle
    };
    venn: Venn;
}

export interface GridSpec extends SceneSpec {
    type: 'grid';
    geometry: {
        center?: Point;
        width: number;
        height: number;
    };
    grid: Grid;
}

export interface SpiralSpec extends SceneSpec {
    type: 'spiral';
    geometry: {
        center: Point;
    };
    spiral: Spiral;
}

export interface MandalaSpec extends SceneSpec {
    type: 'mandala';
    geometry: {
        center: Point;
    };
    mandala: Mandala;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a SceneSpec object
 * 
 * @param spec - The object to validate
 * @returns Validated SceneSpec or throws ZodError
 */
export function validateSpec(spec: unknown): SceneSpec {
    return SceneSpecSchema.parse(spec);
}

/**
 * Safe validation that returns a result object
 */
export function safeValidateSpec(spec: unknown): {
    success: boolean;
    data?: SceneSpec;
    error?: z.ZodError;
} {
    const result = SceneSpecSchema.safeParse(spec);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}

/**
 * Check if spec is a circle type
 */
export function isCircleSpec(spec: SceneSpec): spec is CircleSpec {
    return spec.type === 'circle';
}

/**
 * Check if spec is a clock type
 */
export function isClockSpec(spec: SceneSpec): spec is ClockSpec {
    return spec.type === 'clock';
}

/**
 * Check if spec is a venn type
 */
export function isVennSpec(spec: SceneSpec): spec is VennSpec {
    return spec.type === 'venn';
}

/**
 * Check if spec is a grid type
 */
export function isGridSpec(spec: SceneSpec): spec is GridSpec {
    return spec.type === 'grid';
}

/**
 * Check if spec is a spiral type
 */
export function isSpiralSpec(spec: SceneSpec): spec is SpiralSpec {
    return spec.type === 'spiral';
}

/**
 * Check if spec is a mandala type
 */
export function isMandalaSpec(spec: SceneSpec): spec is MandalaSpec {
    return spec.type === 'mandala';
}

// ============================================================================
// LABEL VALUE GENERATORS
// ============================================================================

/**
 * Generate label values based on spec
 * 
 * @param labels - Labels configuration
 * @param count - Number of labels to generate
 * @returns Array of label strings
 */
export function generateLabelValues(
    labels: Labels,
    count: number
): string[] {
    if (Array.isArray(labels.values)) {
        // Use provided array, cycling if needed
        return Array.from({ length: count }, (_, i) =>
            labels.values[i % (labels.values as string[]).length]
        );
    }

    switch (labels.values) {
        case 'numeric':
            return Array.from({ length: count }, (_, i) => String(i + 1));

        case 'alpha':
            return Array.from({ length: count }, (_, i) => {
                // A-Z, then AA, AB, etc.
                if (i < 26) {
                    return String.fromCharCode(65 + i);
                }
                return String.fromCharCode(65 + Math.floor(i / 26) - 1) +
                    String.fromCharCode(65 + (i % 26));
            });

        case 'roman':
            return Array.from({ length: count }, (_, i) => toRoman(i + 1));

        default:
            return Array.from({ length: count }, (_, i) => String(i + 1));
    }
}

/**
 * Convert number to Roman numeral
 */
function toRoman(num: number): string {
    const romanNumerals: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
    ];

    let result = '';
    let remaining = num;

    for (const [value, numeral] of romanNumerals) {
        while (remaining >= value) {
            result += numeral;
            remaining -= value;
        }
    }

    return result;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_TEXT_STYLE: TextStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    fontWeight: 'normal',
    fill: '#000000',
};

export const DEFAULT_STYLE: Style = {
    stroke: '#000000',
    strokeWidth: 1,
    fill: 'none',
    background: '#ffffff',
};

export const DEFAULT_OUTPUT: Output = {
    width: 1024,
    height: 1024,
    format: 'both',
};

/**
 * Apply defaults to a partial spec
 */
export function applyDefaults(spec: SceneSpec): SceneSpec {
    return {
        ...spec,
        style: { ...DEFAULT_STYLE, ...spec.style },
        output: { ...DEFAULT_OUTPUT, ...spec.output },
        labels: spec.labels ? {
            ...spec.labels,
            style: { ...DEFAULT_TEXT_STYLE, ...spec.labels.style },
        } : undefined,
    };
}
