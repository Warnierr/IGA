# Research Synthesis — Precision Overlay Engine

> **Protocol**: Each external technique is summarized with source, capability, module mapping, and decision.

---

## 1. The 6 Problems of T2I (Formalization)

Text-to-Image models "paint" but do not "construct". We classify their failures into 6 families:

| Family | Definition | Example | Solution Strategy |
|--------|------------|---------|-------------------|
| **A. Cardinality** | $N_{gen} \neq N_{prompt}$ | "9 apples" -> 8 apples | Detection + Count + Patch |
| **B. Topology** | Graph connectivity errors | Flowchart A->B | Symbolic Graph Rendering (SVG) |
| **C. Geometry** | Metric deviation ($err > \epsilon$) | "30° angle" | **Deterministic Overlay** (Current) |
| **D. Layout** | Collision / Misalignment | Venn Diagram | Constraint Solver (Anti-collision) |
| **E. Text** | Malformed symbols | Periodic Table | Vector Overlay Only |
| **F. Semantic** | Relational logic error | "Cat left of Dog" | VLM Verification + Inpainting |

## 2. The Universal Pipeline

A reusable method for all families:

1.  **Spec (Truth)**: JSON definition of the structure (e.g., `time: "03:27"`)
2.  **Gen (Style)**: T2I generates style/background/texture (ignore structure)
3.  **Construct (Structure)**: Overlay vector truth (SVG/Canvas) on top
4.  **Verify (Diagnostic)**: Measure specific metrics ($err \le 1^{\circ}$, $count == N$)
5.  **Repair (Loop)**: If error, adjust overlay parameters (not prompt)

## 3. The 7 Failure Families — Complete Analysis

> **Source**: Benchmarks T2I-CompBench, VISOR, DrawBench, TIFA, GenEval, STRICT (2025-2026)  
> **Evidence**: Even best models fail 30-70% on these aspects

### Tier 1: Exact Counting ⭐ (Most Common, Easiest to Fix)

**Problem**: Models add/remove 2-5 objects randomly, or fuse/mask them.

| Example (Fails) | Typical Error | How We Fix It |
|-----------------|---------------|---------------|
| "9 red apples in 3×3 grid on table" | Generates 7-11 apples | **Gen** approx → **Detect** (YOLO) → **Count** → **Add/Remove** objects symbolically → **VLM** verify ("How many apples?") → Loop if ≠9 |
| "17 black cats in perfect circle around tree" | Wrong count + irregular circle | **Gen** → **Detect** → **Reposition** to polar coords (17 × 360°/17 = 21.18° each) → **VLM** check |
| "Shelf with exactly 23 colored books" | Missing/duplicate books | **Gen** → **Count** via detection → **Clone/remove** as needed → **VLM** verify |

**Fix Pipeline**: `Generate → Detect(OpenCV/YOLO) → Count → Edit(clone/remove) → Verify(VLM) → Loop`  
**Use Cases**: Infographics, catalogs, educational materials  
**Benchmarks**: T2I-CompBench (counting), GenEval  
**Status**: Planned Milestone C

---

### Tier 2: Spatial Relations ⭐⭐ (Inversions, Worst T2I Weakness)

**Problem**: "Left" becomes "right", objects overlap without logic (per VISOR: worst failure type).

| Example (Fails) | Typical Error | How We Fix It |
|-----------------|---------------|---------------|
| "Cat left of dog, dog right of bird, bird behind tree" | Inverted positions | **Gen** → **Segment** (SAM/YOLO) → **Parse** relations → **Calculate** coords (grid) → **Reposition** → **VLM** ("Where is X vs Y?") |
| "Apple on table, banana right, orange left of banana" | Wrong placement | **Gen** → **Detect** objects → **Constraint solver** (X_banana > X_apple) → **Move** → **VLM** verify |
| "Red cube in front, blue left of it, green behind" | Perspective errors | **Gen** → **3D position** inference → **Depth ordering** (z-index) → **VLM** multi-question check |

**Fix Pipeline**: `Generate → Segment → Parse(scene graph) → Solve(constraints) → Reposition → Verify(VLM)`  
**Use Cases**: Educational diagrams, tutorials, UI mockups  
**Benchmarks**: T2I-CompBench, VISOR (spatial)  
**Status**: Planned Milestone D

---

### Tier 3: Geometric Precision ⭐⭐⭐ (Our Current Focus)

**Problem**: Angles approximated, shapes irregular, labels misplaced.

| Example (Fails) | Typical Error | How We Fix It |
|-----------------|---------------|---------------|
| "Regular pentagon, vertices 1-5 clockwise" | Unequal angles (≠108°) | **Gen** approx → **Calculate** exact angles (trigonometry) → **Overlay SVG** with precise coords → **VLM** ("Are angles equal?") |
| **"Venn diagram, 3 symmetric circles"** | **Asymmetric overlaps** | **Gen** → **Calculate** centroids (geometry) → **Render SVG** circles → **Place labels** in intersections → **VLM** check |
| "Logarithmic spiral, 12 turns, points @30°" | Imprecise curve | **Skip Gen** → **Parametric equations** (SymPy) → **Direct SVG** render → Ground truth only |
| "Cube in cavalier perspective, labeled edges" | Twisted edges | **Gen** background → **Projection matrix** → **SVG overlay** for edges/labels → **VLM** verify |

**Fix Pipeline**: `Generate(optional) → Calculate(trigonometry/SymPy) → Overlay(SVG) → Verify(VLM)`  
**Use Cases**: Math/science diagrams, technical docs, data viz  
**Benchmarks**: SpatialGenEval  
**Status**: ✅ **Circle, Clock done** | 🟡 **Venn in progress**

---

### Tier 4: Symmetry & Patterns ⭐⭐⭐⭐ (Regularity)

**Problem**: Models break symmetry, add random variations.

| Example (Fails) | Typical Error | How We Fix It |
|-----------------|---------------|---------------|
| "Mandala, 8-axis symmetry, identical motifs" | Asymmetric axes | **Gen** base motif → **Apply transforms** (mirror/rotate via OpenCV) → **Force symmetry** symbolically → **VLM** ("Perfectly symmetric?") |
| "Gothic rose, 16 equal symmetric petals" | Unequal petals | **Gen** one petal → **Radial duplicate** (16×) → **SVG transform groups** → **VLM** check |
| "10×10 checkerboard, perfect alternation" | Misaligned/inverted cells | **Skip Gen** → **Algorithmic grid** (pure code) → **SVG render** → Ground truth only |

**Fix Pipeline**: `Generate(base) → Transform(mirror/rotate) → Enforce(symmetry) → Verify(VLM)`  
**Use Cases**: Generative art, decorative patterns, branding  
**Benchmarks**: DrawBench  
**Status**: Planned Milestone E

---

### Tier 5: Topological Structures ⭐⭐⭐⭐⭐ (Graphs/Trees)

**Problem**: Arrows point wrong, boxes misaligned, hierarchies inverted.

| Example (Fails) | Typical Error | How We Fix It |
|-----------------|---------------|---------------|
| "Flowchart: Start → Decision(yes/no) → A/B → End" | Wrong arrows | **Gen** approx → **Parse** (OCR boxes + YOLO arrows) → **Reconstruct** (Graphviz/D3) → **Re-render** → **VLM** ("Arrows correct?") |
| "Phylogenetic tree, 8 balanced branches" | Unbalanced tree | **Gen** → **Detect nodes** → **Force-directed layout** → **Redraw** → **VLM** check hierarchy |
| "Org chart: 1→3→9 pyramid" | Wrong levels | **Skip Gen** → **Hierarchical layout** (pure algo) → **SVG** → Ground truth |

**Fix Pipeline**: `Generate → Parse(structure) → Layout(Graphviz/force) → Re-render → Verify(VLM)`  
**Use Cases**: Business docs, technical diagrams, mind maps  
**Benchmarks**: TIFA (faithfulness)  
**Status**: Planned Milestone F

---

### Tier 6: Structured Text ⭐⭐⭐⭐⭐⭐ (Code/Equations)

**Problem**: Blurry text, wrong indentation, invented symbols (even in 2025 models!).

| Example (Fails) | Typical Error | How We Fix It |
|-----------------|---------------|---------------|
| "E = mc² on blackboard, perfect" | Malformed exponents | **Gen** background → **OCR** extract → **LaTeX render** (MathJax) → **SVG overlay** → **VLM** ("Readable?") |
| "Python code, 4 indentation levels" | Broken indentation | **Gen** background → **OCR** → **Reformat** (Black/Prettier) → **Overlay** with Monaco editor → **VLM** check |
| "Periodic table, 118 aligned cells" | Misaligned symbols | **Skip Gen** → **HTML table** → **Canvas render** → Ground truth only |

**Golden Rule**: **NEVER ask T2I to generate text**. Always overlay.

**Fix Pipeline**: `Generate(background only) → OCR(extract) → Reformat → Overlay(LaTeX/Monaco) → Verify(VLM)`  
**Use Cases**: Education, scientific papers, code tutorials  
**Benchmarks**: STRICT (text evaluation)  
**Status**: Planned Milestone G

---

### Tier 7: Extreme Combinations ⭐⭐⭐⭐⭐⭐⭐ (Multi-constraint)

**Problem**: Combines all failures (count + spatial + geometry + symmetry).

| Example (Fails) | Typical Error | How We Fix It |
|-----------------|---------------|---------------|
| "16 birds in 4×4 grid, each facing center" | Count + grid + orientation all wrong | **Gen** → **Multi-detect** → **Grid layout** + **Rotation calc** → **Multi-VLM** questions → Loop |
| **"Roman clock, XII hours, hands @3:27"** | **Hands wrong, labels misplaced** | **Already solved!** ✅ (Clock spec with exact angles) |
| "Fibonacci visual: 1,1,2,3,5,8,13 circles, aligned" | Sizes + alignment wrong | **Gen** → **Calculate** Fibonacci → **Scale** circles → **Align** → **VLM** verify sequence |

**Fix Pipeline**: Combines all previous pipelines with iteration  
**Use Cases**: Complex infographics, advanced education  
**Status**: ✅ **Roman clock achieved** | Others planned

---

## 4. Bonus Fix Categories

Beyond the 7 tiers, our hybrid approach can also fix:

- **3D Perspective Inconsistencies**: Recalculate vanishing points, redraw edges
- **Exact Color Palettes**: Pantone/RGB calibration via color grading
- **Basic Animations**: GIF rotations via frame-by-frame SVG sequences

---

## 5. Evaluation Metrics (Measurable Success)

Instead of binary Pass/Fail, we define continuous scores:

*   **GeometryScore**: $\max(|angle_{target} - angle_{measured}|)$
*   **CountScore**: $|N_{target} - N_{detected}|$
*   **CollisionScore**: Number of bounding box intersections
*   **LegibilityScore**: OCR confidence average

---

## 5. Layout Control Frameworks — State of the Art (2024-2025)

### ControlNet & Successors

| Technique | Source | Capability | Module Mapping | Decision |
|-----------|--------|------------|----------------|----------|
| **ControlNet++** | GitHub, arXiv | Spatial conditioning via edge/depth maps | `adapters/` | **Adopt later** (Milestone C) |
| **SpatialLock** | arXiv 2025 | Point of Interest (PoI) + Point of Graph (PoG) for precise localization | `core/geometry.ts` | **Inspire design** |
| **LCP-Diffusion** | arXiv 2025 | Dual Layout Control mechanism | `adapters/` | **Postpone** |
| **ZestGuide** | arXiv 2024 | Zero-shot segmentation for spatial control | `verify/` | **Evaluate** |
| **Learn-to-Steer (NVIDIA 2025)** | Dev.to | Cross-attention steering for layouts | `adapters/` | **Monitor** |

### Layout-to-Image Paradigms
- **Two-stage systems**: LLM generates structured layout → diffusion model synthesizes
- **Layout-to-mask-to-image**: Unfold object masks from layouts
- Our approach aligns with this: **Spec → Ground Truth SVG → Overlay**

---

## 3. Neuro-Symbolic AI for Mathematical Constraints

### Key Approaches

| Technique | Source | Capability | Module Mapping | Decision |
|-----------|--------|------------|----------------|----------|
| **Score-based Constrained Generation** | [GitHub: DavideScassola/score-based-constrained-generation](https://github.com/DavideScassola/score-based-constrained-generation) | Zero-shot logical constraints in diffusion | `core/` | **Explore** for Milestone D |
| **SymbolicAI Framework** | GitHub | Primitives + contracts for symbolic rules | `core/sceneSpec.ts` | **Adopt concepts** |
| **Logical Neural Networks (LNNs)** | NeurIPS | Enforce symbolic constraints on neural outputs | Future enhancement | **Postpone** |
| **Relational Constraints in Image Gen** | NeurIPS | Program synthesis for structured generation | `core/geometry.ts` | **Adopt pattern** |

### Our Hybrid Approach
```
┌─────────────────────────────────────────────────────────────┐
│                    NEURO-SYMBOLIC PIPELINE                  │
├─────────────────────────────────────────────────────────────┤
│  SYMBOLIC (Deterministic)     │   NEURAL (Generative)       │
│  ─────────────────────────    │   ──────────────────────    │
│  • SceneSpec JSON             │   • Flux/DALL-E for style   │
│  • Geometry calculations      │   • Vision model for verify │
│  • SVG ground truth           │   • VLM for critique        │
│  • Exact label positions      │   • Optional enhancement    │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Perceptual Verification Loop — Techniques

### Metrics & Tools

| Technique | Source | Use Case | Module Mapping | Decision |
|-----------|--------|----------|----------------|----------|
| **SSIM** | [scikit-image](https://scikit-image.org/docs/stable/api/skimage.metrics.html) | Structural similarity vs ground truth | `verify/ssim.ts` | **Adopt** (core metric) |
| **pHash/dHash** | [imagehash](https://github.com/JohannesBuchner/imagehash) | Perceptual hash for drift detection | `verify/imagehash.ts` | **Adopt** |
| **PSNR** | OpenCV | Peak signal-to-noise ratio | `verify/ssim.ts` | **Adopt** (secondary) |
| **HoughCircles** | [OpenCV](https://docs.opencv.org/4.x/da/d53/tutorial_py_houghcircles.html) | Circle detection (center/radius) | `verify/detectCircle.ts` | **Adopt** (essential) |
| **Canny Edge Detection** | OpenCV | Contour extraction | `verify/detectCircle.ts` | **Adopt** |

### Verification Loop Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                  PERCEPTUAL VERIFICATION LOOP               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐    ┌─────────────┐    ┌────────────────┐     │
│   │ Generate│───▶│   Measure   │───▶│    Compare     │     │
│   │  Image  │    │ SSIM/pHash  │    │  vs Threshold  │     │
│   └─────────┘    └─────────────┘    └───────┬────────┘     │
│        ▲                                    │              │
│        │         ┌─────────────┐            │              │
│        └─────────│   Correct   │◀───────────┘              │
│         (if fail)│ (heuristics)│   (if < 0.95)             │
│                  └─────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Thresholds (Configurable)
- **SSIM**: ≥ 0.95 (strict), ≥ 0.90 (tolerant)
- **pHash distance**: ≤ 5 (similar), ≤ 10 (acceptable)
- **Angle deviation**: ≤ 1° tolerance
- **Label collision**: 0 overlaps allowed

---

## 5. Post-Processing & Overlay Tools

### Deterministic Rendering

| Tool | Capability | Language | Decision |
|------|------------|----------|----------|
| **ImageMagick** | CLI text overlay with precise coordinates | CLI/Bash | **Adopt** as fallback |
| **Pillow (PIL)** | Python image manipulation | Python | **Adopt** for Python scripts |
| **Sharp** | High-perf Node.js image processing | Node.js | **Adopt** for TS pipeline |
| **resvg** | SVG→PNG with high fidelity | Rust/WASM | **Adopt** for SVG rendering |
| **OpenCV** | Circle/edge detection + processing | Python/JS | **Adopt** for verification |

### SVG as Ground Truth
- **Why SVG?**: Mathematically perfect, scalable, editable
- **Export flow**: SceneSpec → SVG → PNG → Compose with background
- **Libraries**: D3.js, svg.js, or raw XML generation

---

## 6. Iterative Refinement Frameworks

### Research Approaches

| Framework | Source | Mechanism | Module Mapping | Decision |
|-----------|--------|-----------|----------------|----------|
| **LIRF** | arXiv | Contraction mapping in latent space | Future | **Monitor** |
| **PARM** | CVPR 2025 | Step-by-step verification reward | `verify/` | **Adopt concepts** |
| **Reflect-DiT** | ICCV 2025 | VLM critique → regeneration | Milestone D | **Adopt for auto-correct** |
| **Human-in-loop (YOLO-CID)** | Frontiers | Human flag for deviations | Optional | **Postpone** |

### Our Iterative Strategy
1. **Max iterations**: 5 (configurable)
2. **Per iteration**:
   - Measure deviation from ground truth
   - Apply heuristic corrections (offset, font scale, anti-collision)
   - Re-render overlay only (not background)
3. **Exit conditions**:
   - SSIM ≥ threshold
   - Max iterations reached
   - No improvement between iterations

---

## 7. Model Recommendations by Task

Based on research and Anthropic/Google documentation:

| Task | Recommended Model | Rationale |
|------|-------------------|-----------|
| **Plan/Spec Writing** | Claude Sonnet 4.5 | Best balance for planning + code |
| **Architecture Decisions** | Claude Opus 4.5 | Deep reasoning for hard problems |
| **Deep Research** | Claude Opus 4.5 | Consolidation + synthesis |
| **File Structure** | Claude Sonnet 4.5 | Pragmatic, good at conventions |
| **Code Implementation** | Claude Sonnet 4.5 | Optimized for coding + agents |
| **Image Generation/Editing** | Gemini 3 Pro | Google ecosystem, image APIs |
| **Testing Loop** | Claude Sonnet 4.5 | Terminal integration |

### Orchestration Strategy
```
┌───────────────────────────────────────────────────────────┐
│                    MODEL ORCHESTRATION                     │
├───────────────────────────────────────────────────────────┤
│                                                           │
│   Claude Sonnet 4.5 ──── "Dev Lead" ──── impl + tests    │
│         │                                                 │
│         ▼                                                 │
│   Claude Opus 4.5 ───── "Architect" ──── hard decisions  │
│         │                                                 │
│         ▼                                                 │
│   Gemini 3 Pro ──────── "Image Lab" ──── T2I adapters    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 8. GitHub & HuggingFace Resources

### Relevant Repositories

| Repository | Purpose | Stars | Decision |
|------------|---------|-------|----------|
| [JohannesBuchner/imagehash](https://github.com/JohannesBuchner/imagehash) | Perceptual hashing | 3.1k+ | **Use** |
| [DavideScassola/score-based-constrained-generation](https://github.com/DavideScassola/score-based-constrained-generation) | Neuro-symbolic diffusion | Research | **Study** |
| [lllyasviel/ControlNet](https://github.com/lllyasviel/ControlNet) | Spatial conditioning | 30k+ | **Reference** |
| [gertalot/cursor-rules](https://github.com/gertalot/cursor-rules) | Spec-driven dev rules | Community | **Adapt** |

### HuggingFace Spaces
- **Image-to-Image demos**: Study overlay techniques
- **Vision models**: Evaluate for verification (LLaVA, GPT-4V, Gemini)

---

## 9. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary language** | TypeScript | Fast iteration, browser-compatible |
| **Verification Python** | Allowed | OpenCV/scikit-image ecosystem |
| **SVG as intermediate** | Yes | Mathematical precision |
| **SSIM threshold** | 0.95 | Strict accuracy requirement |
| **Circle30 as demo** | Yes | Clear geometric constraints |
| **Spec-driven workflow** | Required | Quantified, trackable progress |

---

## 10. Next Research Actions

- [ ] Evaluate SpatialLock paper for PoI concepts
- [ ] Test imagehash library performance
- [ ] Benchmark Sharp vs resvg for SVG rendering
- [ ] Study ControlNet for optional background enhancement
- [ ] Evaluate Gemini Vision API for verification alternative
