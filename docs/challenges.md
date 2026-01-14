# Challenge Benchmarks — Precision Overlay Engine

> **Source**: Curated challenging prompts designed to expose T2I model weaknesses  
> **Purpose**: Test our hybrid approach across all 7 tiers  
> **Classification**: 3 difficulty levels based on multi-dimensional complexity

---

## Overview

These prompts combine 3-6 failure dimensions simultaneously (counting + spatial + geometry + perspective + symmetry). Even state-of-the-art models (Seedream 4.5, Flux, DALL·E 3) fail on these in 2025-2026.

**Our Goal**: Achieve 100% accuracy on all 8 challenges using the hybrid pipeline.

---

## Level 1: Moderate Challenges (Counting + Simple 3D)

### Challenge 1.1: Numbered Apples in Circle (3D Perspective)

**Prompt**: *"Exactly 12 red apples arranged in a perfect circle around a central tree, viewed from above in 3D perspective, with each apple numbered 1 to 12 clockwise."*

| Dimension | Challenge | Our Solution |
|-----------|-----------|--------------|
| **Counting** | Exactly 12 (not 11/13) | **Tier 1**: Detect → Count → Add/Remove |
| **Geometry** | Perfect circle | **Tier 3**: Polar coordinates (12 × 30°) |
| **Ordering** | Clockwise 1→12 | **Tier 3**: Sequential labeling |
| **3D Perspective** | Top-down view | **Tier 3**: Perspective projection |

**Verification**:
- Count apples via YOLO detection
- Measure circle regularity (variance from polar positions)
- OCR numbers to verify sequence
- VLM: "How many apples? Are they in a circle? Is numbering correct?"

**Mapped Tiers**: 1 (Counting), 3 (Geometry)  
**Status**: ⚪ Planned

---

### Challenge 1.2: 16 Books on Inclined Shelf (3D Grid)

**Prompt**: *"A 4×4 grid with precisely 16 books of different colors aligned on an inclined shelf in 3D perspective, viewed from the side, with no missing or duplicate books."*

| Dimension | Challenge | Our Solution |
|-----------|-----------|--------------|
| **Counting** | Exactly 16 | **Tier 1**: Detection + count verification |
| **Grid Layout** | 4×4 structure | **Tier 1**: Grid placement algorithm |
| **3D Perspective** | Inclined shelf | **Tier 3**: Projection matrix (cavalier) |
| **Proportions** | Perspective scaling | **Tier 3**: Depth-based sizing |

**Verification**:
- Detect books, count = 16
- Grid detection (Hough lines)
- Perspective angle measurement
- VLM: "Is it a 4×4 grid? Are there 16 books?"

**Mapped Tiers**: 1 (Counting + Grid), 3 (Geometry)  
**Status**: ⚪ Planned

---

## Level 2: Advanced Challenges (Multi-Spatial + 3D)

### Challenge 2.1: Spatial Relations Around Tree (Isometric)

**Prompt**: *"A red cube in front of a blue cube to its left, a green cylinder behind the blue cube, all arranged around a central tree in isometric 3D perspective, with exactly 5 additional yellow spheres in a perfect circle around the tree."*

| Dimension | Challenge | Our Solution |
|-----------|-----------|--------------|
| **Spatial Relations** | front/left/behind | **Tier 2**: Scene graph + constraint solver |
| **Counting** | Exactly 5 spheres | **Tier 1**: Detection + count |
| **Geometry** | Perfect circle | **Tier 3**: Polar positioning |
| **3D Perspective** | Isometric | **Tier 3**: Isometric projection (parallel edges) |

**Verification**:
- Parse spatial relations via VLM
- Detect spheres, count = 5
- Circle regularity check
- Isometric edge parallelism

**Mapped Tiers**: 1 (Counting), 2 (Spatial), 3 (Geometry)  
**Status**: ⚪ Planned

---

### Challenge 2.2: Logarithmic Spiral Birds (3D View from Below)

**Prompt**: *"Exactly 20 black birds sitting in a logarithmic spiral around a tree, viewed from below in 3D perspective, with each bird facing precisely toward the tree center, numbered 1 to 20 in ascending order."*

| Dimension | Challenge | Our Solution |
|-----------|-----------|--------------|
| **Counting** | Exactly 20 | **Tier 1**: Detection + count |
| **Geometry** | Logarithmic spiral | **Tier 3**: Parametric equations (r = a·e^(b·θ)) |
| **Orientation** | All facing center | **Tier 2**: Rotation calculation per position |
| **Ordering** | Sequential 1→20 | **Tier 3**: Path ordering |
| **3D Perspective** | Bottom-up view | **Tier 3**: Camera angle projection |

**Verification**:
- Count birds = 20
- Measure spiral (fit to log equation)
- Orientation vectors point to center
- Number sequence OCR

**Mapped Tiers**: 1 (Counting), 2 (Orientation), 3 (Geometry)  
**Status**: ⚪ Planned

---

## Level 3: Extreme Challenges (Multi-Dimensional Combos)

### Challenge 3.1: Hierarchical Pyramid Around Tree (4 Levels)

**Prompt**: *"A 4-level organizational pyramid in 3D around a central tree: 1 cat at top, 3 dogs at level 2 (left, right, behind), 9 birds at level 3 in a perfect circle, and 27 apples at level 4 in a 3×3×3 grid, all symmetric and without counting errors."*

| Dimension | Challenge | Our Solution |
|-----------|-----------|--------------|
| **Hierarchy** | 4 nested levels | **Tier 5**: Hierarchical layout algorithm |
| **Counting** | 1, 3, 9, 27 progression | **Tier 1**: Multi-level detection + verification |
| **Spatial** | left/right/behind | **Tier 2**: 3D scene graph |
| **Geometry** | Circle (L3) + Grid (L4) | **Tier 3**: Polar + grid hybrid |
| **Symmetry** | Radial around tree | **Tier 4**: Symmetry enforcement |
| **3D Perspective** | Depth ordering | **Tier 3**: Z-index layering |

**Verification**:
- Hierarchical structure validation
- Count per level: 1+3+9+27 = 40 total
- Spatial relations VLM check
- Symmetry measurement

**Mapped Tiers**: 1, 2, 3, 4, 5 (Multi-tier)  
**Status**: ⚪ Planned (Tier 7 equivalent)

---

### Challenge 3.2: Mandala Around Tree (10-Axis Symmetry)

**Prompt**: *"A 10-axis symmetric mandala in 3D perspective, with exactly 25 equal petals arranged in a spiral around a central tree, each petal containing a number 1-25 and a small red cube oriented outward, viewed from an oblique angle."*

| Dimension | Challenge | Our Solution |
|-----------|-----------|--------------|
| **Symmetry** | 10-axis radial | **Tier 4**: SVG transform groups (rotation) |
| **Counting** | Exactly 25 petals | **Tier 1**: Detection + count |
| **Geometry** | Spiral arrangement | **Tier 3**: Parametric spiral |
| **Ordering** | Numbers 1→25 | **Tier 3**: Sequential labeling |
| **Orientation** | Cubes face outward | **Tier 2**: Rotation per petal |
| **3D Perspective** | Oblique view | **Tier 3**: Camera angle projection |

**Verification**:
- Symmetry axis detection (n-fold)
- Petal count = 25
- Spiral regularity
- Cube orientation vectors

**Mapped Tiers**: 1, 2, 3, 4 (Multi-tier)  
**Status**: ⚪ Planned

---

### Challenge 3.3: Fibonacci Visual Around Tree (Helix)

**Prompt**: *"A Fibonacci visual sequence in 3D around a tree: circles sized 1,1,2,3,5,8,13,21 units, arranged in an ascending helical grid, with exactly 8 levels, each circle containing precisely the number of cats matching its size, viewed in cavalier perspective."*

| Dimension | Challenge | Our Solution |
|-----------|-----------|--------------|
| **Mathematics** | Fibonacci sequence | **Tier 3**: Algorithmic sizing (1,1,2,3,5,8,13,21) |
| **Counting** | Variable per level (e.g., 21 cats in L8) | **Tier 1**: Multi-level count verification |
| **Geometry** | Helical 3D grid | **Tier 3**: Parametric helix (x,y,z) |
| **Hierarchy** | 8 ascending levels | **Tier 5**: Vertical spacing |
| **3D Perspective** | Cavalier (parallel edges) | **Tier 3**: Projection matrix |

**Verification**:
- Circle sizes match Fibonacci
- Cat count per circle (sum = 54 cats)
- Helix pitch regularity
- Cavalier edge parallelism

**Mapped Tiers**: 1, 3, 5 (Multi-tier)  
**Status**: ⚪ Planned

---

## Summary Table

| Challenge | Level | Tiers Involved | Dimensions | Status |
|-----------|-------|----------------|------------|--------|
| 1.1 Apples Circle | 1 | 1, 3 | Count + Geometry + Order | ⚪ Planned |
| 1.2 Books Grid | 1 | 1, 3 | Count + Grid + Perspective | ⚪ Planned |
| 2.1 Spatial Tree | 2 | 1, 2, 3 | Count + Spatial + Geometry | ⚪ Planned |
| 2.2 Spiral Birds | 2 | 1, 2, 3 | Count + Geometry + Orient | ⚪ Planned |
| 3.1 Pyramid | 3 | 1, 2, 3, 4, 5 | **All Tiers** | ⚪ Planned |
| 3.2 Mandala | 3 | 1, 2, 3, 4 | Symmetry + Count + Geo | ⚪ Planned |
| 3.3 Fibonacci | 3 | 1, 3, 5 | Math + Count + Helix | ⚪ Planned |

---

## Testing Protocol

For each challenge:

1. **Generate** with T2I model (Flux, DALL·E, Seedream)
2. **Detect** objects (YOLO, SAM)
3. **Count** and verify against spec
4. **Measure** geometry (angles, distances, symmetry)
5. **VLM Verify** with specific questions
6. **Repair** using our hybrid pipeline
7. **Compare** before/after

**Success Criteria**: 100% accuracy on all dimensions after repair loop (max 5 iterations).

---

## Implementation Roadmap

These challenges will be implemented progressively as we complete each tier:

- **Challenges 1.1-1.2**: After Milestone C (Tier 1 complete)
- **Challenges 2.1-2.2**: After Milestone D (Tier 2 complete)
- **Challenges 3.1-3.3**: After Milestone G (All tiers complete)

Each challenge becomes a **regression test** ensuring our solutions scale.
