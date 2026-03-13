from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import uuid
import os
import time

app = FastAPI()

# Enable CORS since the Next.js frontend runs on a different port (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev. Restrict in prod!
    allow_methods=["*"],
    allow_headers=["*"],
)

class NecklaceRequest(BaseModel):
    name: str
    material: str
    hasDiamonds: bool

# Simple in-memory status store for demonstration
# In production, use Redis or a database
jobs = {}

def run_blender_job(job_id: str, request: NecklaceRequest):
    jobs[job_id] = {"status": "processing", "url": None}
    
    # Define output path
    os.makedirs("output", exist_ok=True)
    output_glb = os.path.abspath(f"output/{job_id}.glb")
    
    # Path to the blender script we'll write next
    script_path = os.path.abspath("blender_scripts/generate_jewel.py")
    
    try:
        # Command to run Blender in background
        # Detect OS - Mac uses specific path, Linux usually has 'blender' in PATH
        import platform
        if platform.system() == "Darwin":
            blender_executable = "/Applications/Blender.app/Contents/MacOS/Blender"
        else:
            blender_executable = "blender" # Standard for Ubuntu/Linux VPS
            
        cmd = [
            blender_executable, 
            "-b", # Background (no UI)
            "-P", script_path, # Execute python script
            "--", # Arguments for the script follow
            request.name,
            request.material,                          # e.g. "yellow-gold"
            "true" if request.hasDiamonds else "false", # matches args[2].lower() == "true"
            output_glb                                  # absolute path at args[3]
        ]
        
        print(f"[{job_id}] Starting Blender process...")
        
        process = subprocess.run(cmd, capture_output=True, text=True)
        
        # Log Blender output for debugging
        if process.stdout:
            print(f"[{job_id}] Blender stdout: {process.stdout[-500:]}")
        if process.stderr:
            print(f"[{job_id}] Blender stderr: {process.stderr[-500:]}")
        
        if process.returncode != 0:
            print(f"[{job_id}] Blender failed with code {process.returncode}")
            jobs[job_id] = {"status": "failed", "error": "Blender generation failed"}
            return
        
        # Verify the file was actually created
        if not os.path.exists(output_glb):
            print(f"[{job_id}] ERROR: Blender exited 0 but file not found at {output_glb}")
            jobs[job_id] = {"status": "failed", "error": "Blender did not produce output file"}
            return
            
        print(f"[{job_id}] Finished! File saved to {output_glb}")
        jobs[job_id] = {"status": "completed", "url": f"/models/{job_id}.glb"}
        
    except Exception as e:
        print(f"[{job_id}] Error: {str(e)}")
        jobs[job_id] = {"status": "failed", "error": str(e)}

@app.post("/api/generate")
async def request_generation(req: NecklaceRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "pending", "url": None}
    
    background_tasks.add_task(run_blender_job, job_id, req)
    
    return {"job_id": job_id, "status": "pending"}

@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

# Endpoint to serve generated models
from fastapi.responses import FileResponse
@app.get("/models/{filename}")
async def get_model(filename: str):
    file_path = f"output/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Model file not found")
