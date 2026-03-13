from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import subprocess
import uuid
import os

app = FastAPI(title="Jewelry Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ────────────────────────────────────────────────────────────────────

class NecklaceRequest(BaseModel):
    name:        str
    material:    str   = "yellow-gold"   # yellow-gold | white-gold | rose-gold | silver
    font:        str   = "pacifico"      # pacifico | cinzel | dancing | bebas
    hasDiamonds: bool  = False

# In-memory job store (use Redis in production)
jobs = {}

# ─── Background Job ────────────────────────────────────────────────────────────

def run_jewelry_job(job_id: str, req: NecklaceRequest):
    jobs[job_id] = {"status": "processing", "glb_url": None, "stl_url": None}

    backend_dir  = os.path.dirname(os.path.abspath(__file__))
    output_dir   = os.path.join(backend_dir, "output")
    os.makedirs(output_dir, exist_ok=True)

    output_glb   = os.path.join(output_dir, f"{job_id}.glb")
    output_stl   = os.path.join(output_dir, f"{job_id}.stl")
    script_path  = os.path.join(backend_dir, "blender_scripts", "generate_jewel.py")
    scad_path    = os.path.join(backend_dir, "pendant.scad")

    # Detect Blender
    import platform
    blender_exe = "/Applications/Blender.app/Contents/MacOS/Blender" \
        if platform.system() == "Darwin" else "blender"

    # ── Step 1: Blender → GLB (preview) ───────────────────────────────────────
    print(f"[{job_id}] Step 1: Generating GLB preview…")
    blender_cmd = [
        blender_exe, "-b", "-P", script_path, "--",
        req.name,
        req.material,
        req.font,
        "true" if req.hasDiamonds else "false",
        output_glb,
    ]
    r1 = subprocess.run(blender_cmd, capture_output=True, text=True)
    if r1.stdout: print(f"[{job_id}] Blender: {r1.stdout[-400:]}")
    if r1.stderr: print(f"[{job_id}] Blender ERR: {r1.stderr[-400:]}")

    if r1.returncode != 0 or not os.path.exists(output_glb):
        print(f"[{job_id}] Blender GLB failed (code {r1.returncode})")
        jobs[job_id] = {"status": "failed", "error": "GLB generation failed"}
        return

    print(f"[{job_id}] GLB OK: {os.path.getsize(output_glb):,} bytes")

    # ── Step 2: OpenSCAD → STL (print-ready) ─────────────────────────────────
    print(f"[{job_id}] Step 2: Generating print-ready STL…")

    # Font name → OpenSCAD font string
    font_map = {
        "pacifico": "Pacifico",
        "cinzel":   "Cinzel:style=Regular",
        "dancing":  "Dancing Script:style=Regular",
        "bebas":    "Bebas Neue:style=Regular",
    }
    openscad_font = font_map.get(req.font, "Pacifico")

    # Install fonts for OpenSCAD (needs them in ~/.fonts or /usr/share/fonts)
    fonts_dir = os.path.join(backend_dir, "..", "public", "fonts")
    fonts_dir = os.path.abspath(fonts_dir)

    scad_cmd = [
        "xvfb-run", "-a",
        "openscad",
        "-o", output_stl,
        scad_path,
        "-D", f'NAME="{req.name}"',
        "-D", f'FONT="{openscad_font}"',
        "--fontpath", fonts_dir,
    ]
    r2 = subprocess.run(scad_cmd, capture_output=True, text=True)
    if r2.stdout: print(f"[{job_id}] OpenSCAD: {r2.stdout[-300:]}")
    if r2.stderr: print(f"[{job_id}] OpenSCAD ERR: {r2.stderr[-300:]}")

    # ── Step 3: Trimesh validation ────────────────────────────────────────────
    stl_ok = os.path.exists(output_stl) and os.path.getsize(output_stl) > 1000
    if stl_ok:
        try:
            import trimesh
            mesh = trimesh.load(output_stl)
            watertight = bool(mesh.is_watertight)
            volume_mm3 = round(mesh.volume * 1e9, 1)  # m³ → mm³
            print(f"[{job_id}] STL OK — watertight={watertight}, volume={volume_mm3}mm³")
        except Exception as e:
            print(f"[{job_id}] Trimesh check failed: {e}")
            watertight = None
            volume_mm3 = None
    else:
        print(f"[{job_id}] STL generation failed — pendant.scad may need font update")
        watertight = None
        volume_mm3 = None

    jobs[job_id] = {
        "status":     "completed",
        "glb_url":    f"/models/{job_id}.glb",
        "stl_url":    f"/models/{job_id}.stl" if stl_ok else None,
        "watertight": watertight,
        "volume_mm3": volume_mm3,
    }
    print(f"[{job_id}] DONE")


# ─── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/generate")
async def request_generation(req: NecklaceRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(run_jewelry_job, job_id, req)
    return {"job_id": job_id, "status": "pending"}


@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]


@app.get("/models/{filename}")
async def get_model(filename: str):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    file_path   = os.path.join(backend_dir, "output", filename)
    if os.path.exists(file_path):
        content_type = "model/gltf-binary" if filename.endswith(".glb") else "model/stl"
        return FileResponse(file_path, media_type=content_type,
                            filename=filename)
    raise HTTPException(status_code=404, detail="Model file not found")
