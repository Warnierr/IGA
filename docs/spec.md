# Technical Specification — Precision Overlay Engine

> **Version**: 1.1.0  
> **Status**: Draft  
> **Last Updated**: 2026-01-14

---

## 1. Executive Summary

Precision Overlay Engine is a pipeline that generates **mathematically exact** images by combining symbolic geometry calculations with AI-generated backgrounds. It addresses the fundamental limitation of T2I models (Flux, DALL·E, Stable Diffusion) which cannot guarantee geometric precision.

### Core Innovation
Instead of trying to make T2I models mathematically precise, we:
1. **Generate** a stylized background with AI (optional)
2. **Calculate** exact positions symbolically
3. **Overlay** labels/elements deterministically
4. **Verify** output against ground truth
5. **Correct** automatically if needed

---

## 2. SceneSpec Format

The `SceneSpec` is the central contract that defines what to render.

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SceneSpec",
  "type": "object",
  "required": ["type", "id", "geometry"],
  "properties": {
    "type": {
      "type": "string",
      "enum": ["circle", "grid", "axis", "compass", "radar", "timeline", "clock", "venn"]
    },
    "id": {
      "type": "string",
      "description": "Unique identifier for the scene"
    },
    "geometry": {
      "type": "object",
      "properties": {
        "center": { "$ref": "#/definitions/point" },
        "radius": { "type": "number", "minimum": 0 },
        "width": { "type": "number", "minimum": 0 },
        "height": { "type": "number", "minimum": 0 }
      }
    },
    "segments": {
      "type": "object",
      "properties": {
        "count": { "type": "integer", "minimum": 1 },
        "startAngle": { "type": "number", "default": 0 },
        "direction": { "type": "string", "enum": ["cw", "ccw"], "default": "cw" }
      }
    },
    "labels": {
      "type": "object",
      "properties": {
        "values": {
          "oneOf": [
            { "type": "array", "items": { "type": "string" } },
            { "type": "string", "enum": ["numeric", "alpha", "roman"] }
          ]
        },
        "style": { "$ref": "#/definitions/textStyle" },
        "placement": {
          "type": "string",
          "enum": ["inside", "outside", "on-line"],
          "default": "outside"
        },
        "offsetRadius": { "type": "number", "default": 1.1 }
      }
    },
    "clock": {
      "type": "object",
      "properties": {
        "time": { "type": "string", "pattern": "^\\d{1,2}:\\d{2}(:\\d{2})?$" },
        "hands": {
            "type": "object",
            "properties": {
                "hour": { "$ref": "#/definitions/handStyle" },
                "minute": { "$ref": "#/definitions/handStyle" },
                "second": { "$ref": "#/definitions/handStyle" }
            }
        }
      }
    },
    "venn": {
        "type": "object",
        "properties": {
            "sets": { "type": "array", "items": { "type": "string" } }, 
            "overlaps": { "type": "object" } 
        }
    },
    "style": {
      "type": "object",
      "properties": {
        "stroke": { "type": "string" },
        "strokeWidth": { "type": "number" },
        "fill": { "type": "string" },
        "background": { "type": "string" }
      }
    },
    "output": {
      "type": "object",
      "properties": {
        "width": { "type": "integer", "default": 1024 },
        "height": { "type": "integer", "default": 1024 },
        "format": { "type": "string", "enum": ["svg", "png", "both"], "default": "both" }
      }
    }
  },
  "definitions": {
    "point": {
      "type": "object",
      "properties": {
        "x": { "type": "number" },
        "y": { "type": "number" }
      },
      "required": ["x", "y"]
    },
    "textStyle": {
      "type": "object",
      "properties": {
        "fontFamily": { "type": "string", "default": "Arial" },
        "fontSize": { "type": "number", "default": 16 },
        "fontWeight": { "type": "string", "default": "normal" },
        "fill": { "type": "string", "default": "#000000" }
      }
    },
    "handStyle": {
      "type": "object",
      "properties": {
        "width": { "type": "number" },
        "length": { "type": "number" },
        "color": { "type": "string" },
        "shape": { "type": "string", "enum": ["line", "arrow", "tapered"] }
      }
    }
  }
}
```

### Example: circle30.json

```json
{
  "type": "circle",
  "id": "circle30",
  "geometry": {
    "center": { "x": 512, "y": 512 },
    "radius": 400
  },
  "segments": {
    "count": 30,
    "startAngle": 0,
    "direction": "cw"
  },
  "labels": {
    "values": "numeric",
    "style": {
      "fontFamily": "Inter",
      "fontSize": 24,
      "fontWeight": "bold",
      "fill": "#1a1a2e"
    },
    "placement": "outside",
    "offsetRadius": 1.12
  },
  "style": {
    "stroke": "#16213e",
    "strokeWidth": 2,
    "fill": "none",
    "background": "#ffffff"
  },
  "output": {
    "width": 1024,
    "height": 1024,
    "format": "both"
  }
}
```

### Example: clock-complex.json

```json
{
  "type": "clock",
  "id": "clock-paris",
  "geometry": { "center": { "x": 512, "y": 512 }, "radius": 400 },
  "clock": {
    "time": "10:10:30",
    "hands": {
      "hour": { "width": 15, "length": 0.5, "color": "#000" },
      "minute": { "width": 10, "length": 0.8, "color": "#333" },
      "second": { "width": 4, "length": 0.9, "color": "#e74c3c" }
    }
  },
  "segments": {
    "count": 12,
    "startAngle": -90,
    "direction": "cw"
  },
  "labels": {
    "values": ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    "placement": "outside"
  }
}
```

### Example: venn3.json

```json
{
  "type": "venn",
  "id": "venn-data-science",
  "geometry": { "center": { "x": 512, "y": 512 }, "radius": 250 },
  "venn": {
    "sets": ["CS", "Math", "Domain"],
    "overlaps": {
      "CS,Math": "ML",
      "CS,Domain": "Software",
      "Math,Domain": "Research",
      "CS,Math,Domain": "Data Science"
    }
  },
  "style": { "background": "white", "fill": "rgba(255, 0, 0, 0.1)" }
}
```

---

## 3. Geometry Module

### Core Functions

```typescript
// geometry.ts

// ... (existing functions)

/**
 * Calculate needle angles from time string
 * @param time - "HH:MM:SS"
 * @returns angles in degrees (0 = top)
 */
function calculateHandAngles(time: string): { h: number, m: number, s: number };

/**
 * Calculate centroids for Venn diagram circles
 * @param center - Center of the whole diagram
 * @param radius - Radius of individual circles
 * @returns Array of 3 points
 */
function calculateVennCentroids(center: Point, radius: number): Point[];
```

---

## 4. SVG Generation

### Clock SVG Structure

```xml
<!-- Hands -->
<g id="hands">
  <!-- Hour -->
  <line x1="512" y1="512" x2="512" y2="300" stroke="#000" stroke-width="15" transform="rotate(305 512 512)"/>
  <!-- Minute -->
  <line x1="512" y1="512" x2="512" y2="200" stroke="#333" stroke-width="10" transform="rotate(63 512 512)"/>
  <!-- Second -->
  <line x1="512" y1="512" x2="512" y2="180" stroke="#e74c3c" stroke-width="4" transform="rotate(180 512 512)"/>
</g>
```

---

## 5. Verification Module (Updated)

### Metric Diagnostics

Instead of single pass/fail, return diagnostic object:

```json
{
  "diagnostics": {
    "count": { "expected": 12, "actual": 12, "status": "pass" },
    "geometry": { "max_angle_error": 0.5, "status": "pass" },
    "hands": { 
      "hour_angle": { "expected": 305, "measured": 304, "diff": 1 },
      "status": "pass"
    }
  }
}
```
