# Local Correction Engine (Prototype)

This folder contains the Python implementation of the **Neuro-Symbolic Correction Pipeline**.

## Prerequisites
- Python 3.10+
- NVidia GPU (GTX 4070 or better recommended for local Inference)
- CUDA Toolkit

## Installation
```bash
pip install -r requirements.txt
```

## Structure
- `main.py`: The orchestrator script. Currently mocks the detection step but implements the full geometric logic.
- `geometry.py`: The mathematical core. Uses NumPy to calculate exact positions (Grid, Spiral, Mandala) based on our Typescript specs.
- `detectors.py`: (To be implemented) Wrappers for YOLOv11 and SAM 2.

## How to use
1. Run `python main.py` to test the logic flow.
2. It will generate a `debug_mask_grid.png`. This represents the **Ground Truth** (Symbolic Layer).
3. In a full implementation, this mask is sent to **ControlNet** (Stable Diffusion) to force the generation of the final image.

## Next Steps for You
1. Install **ComfyUI** locally.
2. Link this script to ComfyUI API (websocket).
3. Replace `mock_yolo_detect` with real `ultralytics` calls.
