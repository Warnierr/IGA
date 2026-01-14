---
project: "Precision Overlay Engine (IGA)"
repoUrl: "https://github.com/Warnierr/IGA"
methodology: "Agile"
status: "active"
version: "0.1.0"
startDate: "2026-01-14"
targetEndDate: "2026-06-30"
---

# Precision Overlay Engine - Roadmap

## Vue d'ensemble

**Progression globale**: 25%
**Tâches complétées**: 5/20
**Méthodologie**: Agile
**Statut**: Active

---

## Phase 1: MVP Exact Overlay [2026-01-14 → 2026-02-28]

Progression: 100%

- [x] A1: Define SceneSpec JSON format (high) [100%]
  - TypeScript types créés dans `src/core/sceneSpec.ts`
  - JSON Schema pour validation avec Zod
  - Exemples de specs créés (circle30, clock12, clock-3h27, clock-10h10, venn3)

- [x] A2: Implement geometry calculations (high) [100%]
  - Polar-to-Cartesian conversion
  - Segment position calculator
  - Direction handling (CW/CCW)
  - Tests unitaires implémentés

- [x] A3: Generate SVG ground truth (high) [100%]
  - `svgGroundTruth.ts` créé
  - Export SVG mathématiquement exact
  - Inclut cercle, lignes, labels
  - Tests unitaires implémentés

- [x] A4: Render to PNG (high) [100%]
  - SVG-to-PNG using Sharp
  - High-fidelity rasterization
  - Exemples PNG générés (circle30, clock12, etc.)

- [x] A5: Create CLI (medium) [100%]
  - Command: `precisio render --spec --out` implémenté
  - Parse arguments with Commander.js
  - Commands: render, verify, ground-truth, demo
  - Examples générés avec succès

---

## Phase 2: Perceptual Verification [2026-03-01 → 2026-03-31]

Progression: 0%

- [ ] B1: Circle detection (high) [0%]
  - OpenCV HoughCircles integration
  - Center/radius extraction
  - Deviation measurement

- [ ] B2: SSIM comparison (high) [0%]
  - Ground truth vs output
  - Configurable threshold (default 0.95)
  - Secondary: PSNR metric

- [ ] B3: Perceptual hashing (medium) [0%]
  - pHash/dHash implementation
  - Distance calculation
  - Tolerance thresholds

- [ ] B4: Report generation (medium) [0%]
  - JSON report format
  - Metrics: SSIM, pHash, detection
  - Pass/fail status + errors

---

## Phase 3: Stylized Background + Composition [2026-04-01 → 2026-04-30]

Progression: 0%

- [ ] C1: Flux/DALL-E adapter (medium) [0%]
  - Generate styled backgrounds
  - Prompt template for circles
  - Save intermediate files

- [ ] C2: Composition pipeline (high) [0%]
  - Load background image
  - Overlay exact SVG layer
  - Export final composite

- [ ] C3: Quality fallback (low) [0%]
  - Detect if background is too noisy
  - Fallback to pure SVG mode
  - Log warning in report

---

## Phase 4: Auto-correction Loop [2026-05-01 → 2026-05-31]

Progression: 0%

- [ ] D1: Correction heuristics (high) [0%]
  - Offset adjustments for labels
  - Font scaling based on space
  - Anti-collision repositioning

- [ ] D2: Iterative engine (high) [0%]
  - Max N iterations (configurable)
  - Exit on threshold met
  - Exit on no improvement

- [ ] D3: Iteration tracking (medium) [0%]
  - Log each iteration metrics
  - Record what changed
  - Include in report

- [ ] D4: Before/after export (low) [0%]
  - Save original attempt
  - Save final corrected
  - Visual diff report

---

## Phase 5: Shareable Product [2026-06-01 → 2026-06-30]

Progression: 0%

- [ ] E1: Web demo (high) [0%]
  - Next.js application
  - Upload spec → render → download
  - Live preview in browser

- [ ] E2: Presets library (medium) [0%]
  - `circle30`, `clock12`, `compass16`, `radar8`
  - Dropdown selector in demo
  - Custom spec editor

- [ ] E3: Clean repository (medium) [0%]
  - Complete README
  - Example images gallery
  - Contributing guidelines

- [ ] E4: CI/CD + npm (high) [0%]
  - GitHub Actions for tests
  - Automated releases
  - npm publish workflow

---

## Phase 6: Tier 1 - Exact Counting (Grid Objects) [Future]

Progression: 0%

- [ ] F1: Define GridObjectSpec (medium) [0%]
  - Object count, type, spacing
  - Grid dimensions (rows×cols)

- [ ] F2: Implement grid layout (high) [0%]
  - Calculate cell positions
  - Center objects in cells

- [ ] F3: Object detection + counting (high) [0%]
  - YOLO integration for verification
  - Count mismatch detection

- [ ] F4: Auto-add/remove objects (medium) [0%]
  - Add duplicates if count < target
  - Remove extras if count > target

---

## Phase 7: Tier 2 - Spatial Relations (Scene Graph) [Future]

Progression: 0%

- [ ] G1: Spatial vocabulary (medium) [0%]
  - left/right/above/below
  - behind/in-front-of
  - near/far

- [ ] G2: Scene graph parser (high) [0%]
  - Parse relation chains
  - Build constraint graph

- [ ] G3: Constraint solver (high) [0%]
  - Satisfy all spatial constraints
  - Handle conflicts gracefully

- [ ] G4: Depth ordering (medium) [0%]
  - Z-index for layers
  - Occlusion rendering

---

## Notes techniques

- **Current Focus**: Milestone A (MVP Exact Overlay) - ✅ 100% complété
- **Tests**: Vitest configuré, tests unitaires pour geometry, sceneSpec, svgGroundTruth
- **Examples**: circle30, clock12, clock-3h27, clock-10h10, venn3 fonctionnels avec PNG et SVG
- **CLI**: Fonctionnel avec commands render, verify, ground-truth, demo
- **Prochaine étape**: Milestone B (Perceptual Verification)
- **Blockers**: Aucun actuellement

---

> Dernière mise à jour: 2026-01-14
> Format compatible avec AiMonitoring
