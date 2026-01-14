# Precision Overlay Engine

> **Make text-to-image outputs mathematically and spatially exact.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Problem

Text-to-Image models (Flux, DALL·E, Stable Diffusion) are **structurally weak** at exact geometry. They optimize for visual plausibility, not mathematical constraints. Labels get misplaced, angles are approximate, order is often wrong.

## 💡 Solution

**Precision Overlay Engine** combines:
1. **Symbolic geometry** → Calculate exact positions mathematically
2. **Deterministic overlay** → Place labels with pixel-perfect precision  
3. **Perceptual verification** → Validate output with SSIM/pHash
4. **Optional AI backgrounds** → Style with Flux/DALL-E while keeping precision

## 🚀 Killer Demo

**Circle30**: 30 segments at 12° each, labels 1..30, configurable start angle, CW/CCW.

```bash
precisio render --spec specs/circle30.json --out circle30.png
```

![Circle30 Demo](examples/circle30/out.png)

## 🎯 The 7 Tiers Vision

A systematic approach to solving **all T2I failure families**:

| Tier | Challenge | Status | Example |
|------|-----------|--------|---------|
| **1** | Exact Counting | Planned (C) | "9 apples in 3×3 grid" |
| **2** | Spatial Relations | Planned (D) | "Cat left of dog" |
| **3** | Geometric Precision | ✅ **Active** | **Circle, Clock, Venn (next)** |
| **4** | Symmetry & Patterns | Planned (E) | Mandala with 8-axis |
| **5** | Topological Structures | Planned (F) | Flowchart with arrows |
| **6** | Structured Text | Planned (G) | LaTeX equations, code |
| **7** | Extreme Combinations | ✅ Partial | Roman clock at 3:27 |

**Current Status**: Tier 3 complete (Circle 30°, Clock with exact time). Next: **Venn Diagram**.

## 📦 Installation

```bash
npm install precision-overlay
# or
pnpm add precision-overlay
```

## 🛠️ Usage

### CLI

```bash
# Render from spec
precisio render --spec specs/circle30.json --out out.png

# Verify accuracy
precisio verify --image out.png --spec specs/circle30.json

# Generate ground truth SVG only
precisio ground-truth --spec specs/circle30.json --out truth.svg
```

### API

```typescript
import { render, verify, loadSpec } from 'precision-overlay';

const spec = await loadSpec('specs/circle30.json');
const image = await render(spec);
const report = await verify(image, spec);

console.log(`SSIM: ${report.metrics.ssim}`); // 0.99
console.log(`Pass: ${report.pass}`); // true
```

## 📐 SceneSpec Format

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
    "placement": "outside"
  }
}
```

## 📊 Verification Metrics

| Metric | Threshold | Purpose |
|--------|-----------|---------|
| SSIM | ≥ 0.95 | Structural similarity |
| pHash | ≤ 5 | Perceptual hash distance |
| PSNR | ≥ 30 dB | Signal quality |

## 🗺️ Roadmap

See [docs/roadmap.md](docs/roadmap.md) for quantified progress.

| Milestone | Status |
|-----------|--------|
| A - MVP Exact Overlay | 🟡 In Progress |
| B - Perceptual Verification | ⚪ Pending |
| C - Stylized Backgrounds | ⚪ Pending |
| D - Auto-correction Loop | ⚪ Pending |
| E - Shareable Product | ⚪ Pending |

## 📚 Documentation

- [Technical Specification](docs/spec.md)
- [Roadmap & Progress](docs/roadmap.md)
- [Research Synthesis](docs/research.md)
- **[Challenge Benchmarks](docs/challenges.md)** — 8 extreme prompts to test all tiers

## 🤝 Contributing

1. Read `docs/spec.md` and `docs/roadmap.md`
2. Pick an unchecked item
3. Follow the [spec-driven workflow](.cursor/rules/10-spec-driven.mdc)
4. Submit PR with roadmap item reference

## 📄 License

MIT © 2026
