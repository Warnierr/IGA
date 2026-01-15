# AI Model Limitations Report: Geometric & Spatial Reasoning

**Date**: 2026-01-15
**Scope**: Analysis of failure modes in State-of-the-Art (SOTA) Diffusion Models (Midjourney v6, DALL-E 3, Stable Diffusion XL, Flux.1) regarding precision tasks.

## 1. The "Counting" Problem (Tier 1)
**Observation**: Models struggle to generate strictly "N" identical objects when N > 7.
- **Prompt**: "A grid of 16 books" or "12 birds".
- **Result**: Visuals often show 11, 13, or 16 objects but with varying shapes/sizes, breaking the grid pattern.
- **Root Cause**:
  - **Tokenizer Limits**: Large numbers are tokens, not mathematical constraints. The self-attention mechanism "dilutes" the count instruction over the spatial area.
  - **No Internal Counter**: Diffusion models generate pixels statistically, they do not "count" as they draw.

## 2. The "Exact Geometry" Problem (Tier 3)
**Observation**: Mathematical curves (spirals, circles of items) are approximated, not calculated.
- **Example**: Logarithmic Spiral vs. Archimedean Spiral.
- **Result**: Models generate generic "swirls". They cannot distinguish between $r = a\theta$ (Archimedean) and $r = ae^{b\theta}$ (Logarithmic).
- **Consquence**: Items placed on these curves drift off-path. Tangent rotations (items facing the line) are random.

## 3. The "Text & Sequence" Problem (Tier 4)
**Observation**: Generating logical sequences (1, 2, 3...) or distinct character sets (A-Z) in radial patterns is nearly impossible.
- **Example**: Numbered Mandala (1 to 12).
- **Result**:
  - **Hallucination**: "1, 2, 5, 8, 2, C".
  - **Glyph Failure**: Symbols that look like text but aren't readable (pseudolocution).
  - **Sequence Logic**: The model has no concept of "next number". It only knows "clock-like images have numbers".

## 4. The "Spatial Relations" Problem (Tier 2)
**Observation**: Relative positioning (Left/Right/Above) degrades with complexity.
- **Constraint**: "A red box, left of a blue circle, above a green triangle."
- **Failure Mode**: "Attribute Bleeding" (Blue box, red circle) or wrong layout.
- **Technical Barrier**: CLIP/T5 text encoders are "Bag of Words" processors; they struggle to bind attributes (Color) to specific objects (Shape) strictly in space.

---

## 5. Strategic Conclusion: The Need for Neuro-Symbolic Correction
Since Generative AI behaves probabilistically ("What looks right?"), it cannot natively solve deterministic problems ("is X exactly at coord Y?").

**The Solution**: A **Neuro-Symbolic Pipeline**.
1. **Symbolic Engine (Code)**: Defines truth (Positions, Counts, Sequences).
2. **Neural Engine (AI)**: Generates texture, lighting, style.
3. **Correction Layer**: Forcing the Neural output to conform to the Symbolic mask (ControlNet/Inpainting).
