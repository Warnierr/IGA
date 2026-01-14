# Precision Overlay Engine Examples

This directory contains example outputs generated from specs.

## circle30/

The "killer demo" - 30 segments at 12° intervals with numeric labels.

- `out.png` - Rendered PNG
- `out.svg` - Ground truth SVG
- `report.json` - Verification report (after Milestone B)

## clock12/

Classic 12-hour clock layout.

- `out.png` - Rendered PNG
- `out.svg` - Ground truth SVG

---

To regenerate all examples:

```bash
npm run cli -- demo
```
