import argparse
from analysis import VLMAnalyzer, ObjectDetector
from correction import CorrectionEngine
from generation import GenerationEngine, APISelector

def run_pipeline(image_path, prompt, task_type="grid"):
    print("\n" + "="*60)
    print(f"🔄 STARTING NEURO-SYMBOLIC PIPELINE: {task_type.upper()}")
    print("="*60)
    
    # 1. Initialize Modules
    vlm = VLMAnalyzer()
    detector = ObjectDetector()
    corrector = CorrectionEngine()
    generator = GenerationEngine()
    
    # 2. Analyze Input (Perception)
    print("\n[PHASE 1: PERCEPTION]")
    analysis = vlm.analyze(image_path, prompt)
    detections = detector.detect(image_path)
    
    print(f"📊 Analysis: Found {analysis.get('object_count')} objects. Expected {analysis.get('expected_count')}.")
    
    # 3. Logic & Decision (Symbolic)
    print("\n[PHASE 2: SYMBOLIC REASONING]")
    if analysis.get('object_count') != analysis.get('expected_count'):
        print("⚠️  Discrepancy detected! Initiating Correction...")
        
        # 4. Generate Correction Mask
        print("\n[PHASE 3: CORRECTION MASKING]")
        # Assuming 1024x1024 for simplicity
        if task_type == 'grid':
            mask = corrector.generate_grid_mask(1024, 1024, 4, 4)
            mask.save("correction_mask.png")
            print("💾 Mask saved to correction_mask.png")
        elif task_type == 'spiral':
            mask = corrector.generate_spiral_mask(1024, 1024, 12)
            mask.save("correction_mask.png")
            
        # 5. Re-Generation (Neural)
        print("\n[PHASE 4: NEURAL GENERATION]")
        new_prompt = prompt + ", precise geometry, adherence to guide"
        output = generator.generate(new_prompt, control_image=mask, api="local_flux_dev")
        
        print(f"\n✅ Pipeline Complete. Final result: {output}")
        
    else:
        print("✅ Image passes verification. No correction needed.")

if __name__ == "__main__":
    # Simulate a run
    run_pipeline("fail_grid.png", "A grid of 16 books", "grid")
