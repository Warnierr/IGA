# Roadmap — Precision Overlay Engine

> **Progress Tracking**: Quantified without temporal values  
> **Total Items**: 20  
> **Format**: `[ ]` = pending, `[/]` = in progress, `[x]` = done

---

## Progress Summary

| Milestone | Items | Done | Progress |
|-----------|-------|------|----------|
| **A** - MVP Exact Overlay | 5 | 0 | 0% |
| **B** - Perceptual Verification | 4 | 0 | 0% |
| **C** - Stylized Background | 3 | 0 | 0% |
| **D** - Auto-correction Loop | 4 | 0 | 0% |
| **E** - Shareable Product | 4 | 0 | 0% |
| **TOTAL** | **20** | **0** | **0%** |

---

## Milestone A — MVP "Exact Overlay"

**Goal**: Render circle30.json with 100% geometric accuracy.

**Done Criteria**: 
- 100 images generated with labels **perfectly positioned**
- No label overlap, no inversion, no misalignment

### Checklist

- [ ] **A1**: Define `SceneSpec` JSON format
  - Create TypeScript types in `src/core/sceneSpec.ts`
  - Write JSON Schema for validation
  - Create `specs/circle30.json` example

- [ ] **A2**: Implement geometry calculations
  - Polar-to-Cartesian conversion
  - Segment position calculator
  - Direction handling (CW/CCW)

- [ ] **A3**: Generate SVG ground truth
  - Create `svgGroundTruth.ts`
  - Export mathematically exact SVG
  - Include circle, lines, labels

- [ ] **A4**: Render to PNG
  - SVG-to-PNG using Sharp or resvg
  - High-fidelity rasterization

- [ ] **A5**: Create CLI
  - Command: `precisio render --spec --out`
  - Parse arguments with Commander.js
  - Generate `examples/circle30/out.png`

---

## Milestone B — Perceptual Verification

**Goal**: Measure output accuracy against ground truth.

**Done Criteria**:
- SSIM scores ≥ 0.95 on all test images
- Detection finds circle with ≤ 1px deviation

### Checklist

- [ ] **B1**: Circle detection
  - OpenCV HoughCircles integration
  - Center/radius extraction
  - Deviation measurement

- [ ] **B2**: SSIM comparison
  - Ground truth vs output
  - Configurable threshold (default 0.95)
  - Secondary: PSNR metric

- [ ] **B3**: Perceptual hashing
  - pHash/dHash implementation
  - Distance calculation
  - Tolerance thresholds

- [ ] **B4**: Report generation
  - JSON report format
  - Metrics: SSIM, pHash, detection
  - Pass/fail status + errors

---

## Milestone C — Tier 1: Exact Counting (Grid Objects)

**Goal**: Render exactly N objects in grid formation.

**Done Criteria**:
- 9 objects → exactly 9 detected
- Grid spacing is uniform

### Checklist

- [ ] **C1**: Define `GridObjectSpec`
  - Object count, type, spacing
  - Grid dimensions (rows×cols)

- [ ] **C2**: Implement grid layout
  - Calculate cell positions
  - Center objects in cells

- [ ] **C3**: Object detection + counting
  - YOLO integration for verification
  - Count mismatch detection

- [ ] **C4**: Auto-add/remove objects
  - Add duplicates if count < target
  - Remove extras if count > target

---

## Milestone D — Tier 2: Spatial Relations (Scene Graph)

**Goal**: Render objects with exact spatial relationships.

**Done Criteria**:
- "Cat left of dog" → correctly positioned
- Depth ordering (behind/front) works

### Checklist

- [ ] **D1**: Spatial vocabulary
  - left/right/above/below
  - behind/in-front-of
  - near/far

- [ ] **D2**: Scene graph parser
  - Parse relation chains
  - Build constraint graph

- [ ] **D3**: Constraint solver
  - Satisfy all spatial constraints
  - Handle conflicts gracefully

- [ ] **D4**: Depth ordering
  - Z-index for layers
  - Occlusion rendering

---

## Milestone E — Tier 4: Symmetry & Patterns (Mandala)

**Goal**: Render mandala with N-axis perfect symmetry.

**Done Criteria**:
- 8-axis symmetry verified
- Motifs are identical

### Checklist

- [ ] **E1**: Define `MandalaSpec`
  - Symmetry axes count
  - Base motif pattern

- [ ] **E2**: SVG transform groups
  - Rotation transforms
  - Mirror reflections

- [ ] **E3**: Pattern tiling
  - Radial duplication
  - Nested layers

- [ ] **E4**: Symmetry verification
  - Measure rotational symmetry
  - Detect asymmetries

---

## Milestone F — Tier 5: Topological Structures (Flowchart)

**Goal**: Render flowchart with correct arrows and hierarchy.

**Done Criteria**:
- All arrows point correctly
- Boxes aligned properly

### Checklist

- [ ] **F1**: Define `FlowchartSpec`
  - Node types (start, decision, process, end)
  - Edge connections

- [ ] **F2**: GraphViz/D3.js integration
  - Directed graph layout
  - Auto-spacing

- [ ] **F3**: Arrow routing
  - Orthogonal routing
  - Avoid overlaps

- [ ] **F4**: Auto-layout algorithms
  - Sugiyama layering
  - Force-directed alternatives

---

## Milestone G — Tier 6: Structured Text (LaTeX Overlay)

**Goal**: Render equations/code with pixel-perfect text.

**Done Criteria**:
- E=mc² renders correctly
- Code indentation is exact

### Checklist

- [ ] **G1**: LaTeX → SVG converter
  - MathJax/KaTeX integration
  - Symbol precision

- [ ] **G2**: Code highlighter
  - Monaco editor → canvas
  - Syntax highlighting

- [ ] **G3**: Table renderer
  - HTML table → image
  - Dense grids (periodic table)

- [ ] **G4**: Text overlay rule
  - Enforce "never T2I for text"
  - Auto-fallback to overlay

---

## Milestone C — Stylized Background + Composition

**Goal**: Combine AI-generated backgrounds with exact overlays.

**Done Criteria**:
- Pipeline: background → overlay → verify works end-to-end
- Fallback to pure SVG when background is noisy

### Checklist

- [ ] **C1**: Flux/DALL-E adapter
  - Generate styled backgrounds
  - Prompt template for circles
  - Save intermediate files

- [ ] **C2**: Composition pipeline
  - Load background image
  - Overlay exact SVG layer
  - Export final composite

- [ ] **C3**: Quality fallback
  - Detect if background is too noisy
  - Fallback to pure SVG mode
  - Log warning in report

---

## Milestone D — Auto-correction Loop

**Goal**: Automatically fix issues without human intervention.

**Done Criteria**:
- Loop converges in ≤ 5 iterations
- Before/after comparison shows improvement

### Checklist

- [ ] **D1**: Correction heuristics
  - Offset adjustments for labels
  - Font scaling based on space
  - Anti-collision repositioning

- [ ] **D2**: Iterative engine
  - Max N iterations (configurable)
  - Exit on threshold met
  - Exit on no improvement

- [ ] **D3**: Iteration tracking
  - Log each iteration metrics
  - Record what changed
  - Include in report

- [ ] **D4**: Before/after export
  - Save original attempt
  - Save final corrected
  - Visual diff report

---

## Milestone E — Shareable Product

**Goal**: Make the tool usable by the community.

**Done Criteria**:
- README with live demo GIF
- npm package published
- Next.js demo live on Vercel

### Checklist

- [ ] **E1**: Web demo
  - Next.js application
  - Upload spec → render → download
  - Live preview in browser

- [ ] **E2**: Presets library
  - `circle30`, `clock12`, `compass16`, `radar8`
  - Dropdown selector in demo
  - Custom spec editor

- [ ] **E3**: Clean repository
  - Complete README
  - Example images gallery
  - Contributing guidelines

- [ ] **E4**: CI/CD + npm
  - GitHub Actions for tests
  - Automated releases
  - npm publish workflow

---

## Changelog

| Change | Milestone | Item |
|--------|-----------|------|
| *(none yet)* | - | - |
