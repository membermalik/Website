"""
generate_jewel.py  ─  Professional Jewelry Pendant Generator (Blender)
─────────────────────────────────────────────────────────────────────
Called by main.py via subprocess:
  blender -b -P generate_jewel.py -- <name> <material> <font> <has_diamonds> <output_glb>

This script generates a HIGH-QUALITY GLB for web preview.
For print-ready STL use pendant.scad (OpenSCAD pipeline).
"""
import bpy
import sys
import os
import math

# ─── Constants ───────────────────────────────────────────────────────────────

FONTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../public/fonts"))

FONT_MAP = {
    "pacifico":  "Pacifico.ttf",
    "cinzel":    "Cinzel-Regular.ttf",
    "dancing":   "DancingScript-Regular.ttf",
    "bebas":     "BebasNeue-Regular.ttf",
}

MATERIAL_COLORS = {
    "yellow-gold": (0.804, 0.498, 0.196, 1),
    "white-gold":  (0.900, 0.900, 0.920, 1),
    "rose-gold":   (0.804, 0.498, 0.459, 1),
    "silver":      (0.753, 0.753, 0.753, 1),
}

TARGET_WIDTH_M = 0.050   # 50 mm in Blender units (1 BU = 1 m)
PLATE_HEIGHT_M = 0.014   # 14 mm
PLATE_DEPTH_M  = 0.003   # 3 mm
TEXT_DEPTH_M   = 0.0012  # 1.2 mm relief
BAIL_R_MAJOR   = 0.002   # 2 mm torus major radius
BAIL_R_MINOR   = 0.0008  # 0.8 mm tube radius


# ─── Scene Setup ──────────────────────────────────────────────────────────────

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # Enable required add-ons
    bpy.ops.preferences.addon_enable(module="object_boolean_tools") if "object_boolean_tools" in bpy.context.preferences.addons else None


# ─── Pendant Plate ─────────────────────────────────────────────────────────────

def create_plate():
    """Create the pendant back-plate (rounded rectangle)."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    plate = bpy.context.object
    plate.name = "Plate"
    plate.scale = (TARGET_WIDTH_M, PLATE_HEIGHT_M, PLATE_DEPTH_M)
    bpy.ops.object.transform_apply(scale=True)

    # Bevel the edges for a rounded look
    bpy.ops.object.modifier_add(type='BEVEL')
    m = plate.modifiers["Bevel"]
    m.width = 0.0015
    m.segments = 4
    m.limit_method = 'NONE'
    bpy.ops.object.modifier_apply(modifier="Bevel")

    bpy.ops.object.shade_smooth()
    return plate


# ─── Text Relief ────────────────────────────────────────────────────────────────

def create_text_mesh(name: str, font_key: str):
    """Create extruded text, scale to fit plate, return mesh object."""
    bpy.ops.object.text_add(location=(0, 0, PLATE_DEPTH_M - 0.0001))
    txt = bpy.context.object
    txt.name = "TextCurve"
    txt.data.body = name

    # Font
    font_file = os.path.join(FONTS_DIR, FONT_MAP.get(font_key, "Pacifico.ttf"))
    if os.path.exists(font_file):
        try:
            font = bpy.data.fonts.load(font_file)
            txt.data.font = font
        except Exception as e:
            print(f"Font load error: {e}")

    # Extrusion settings (print-quality)
    txt.data.extrude       = TEXT_DEPTH_M
    txt.data.bevel_depth   = 0.0002
    txt.data.bevel_resolution = 2
    txt.data.align_x       = 'CENTER'
    txt.data.align_y       = 'CENTER'
    txt.rotation_euler[0]  = 0  # Text lies flat (XY plane)

    # Convert to mesh for scale/boolean ops
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Scale text so its X dimension matches plate width (minus padding)
    txt.update_from_editmode() if hasattr(txt, 'update_from_editmode') else None
    bpy.context.view_layer.update()
    current_w = txt.dimensions.x
    if current_w > 0.001:
        target = TARGET_WIDTH_M * 0.88   # 88% of plate width = 4.4mm padding each side
        scale_factor = target / current_w
        txt.scale = (scale_factor, scale_factor, 1.0)
        bpy.ops.object.transform_apply(scale=True)

    # Centre text vertically on plate
    txt.location.y = 0
    bpy.ops.object.transform_apply(location=True)

    bpy.ops.object.shade_smooth()
    return txt


# ─── Bail / Öse ────────────────────────────────────────────────────────────────

def create_bail():
    """Create the bail ring above the plate for chain attachment."""
    # Position: top of plate + ring radius
    bail_z = PLATE_DEPTH_M + BAIL_R_MAJOR
    bail_y = PLATE_HEIGHT_M / 2 - BAIL_R_MAJOR * 0.5

    bpy.ops.mesh.primitive_torus_add(
        major_radius=BAIL_R_MAJOR,
        minor_radius=BAIL_R_MINOR,
        major_segments=48,
        minor_segments=16,
        location=(0, bail_y, bail_z),
        rotation=(math.pi / 2, 0, 0)   # Ring opens front-to-back
    )
    bail = bpy.context.object
    bail.name = "Bail"
    bpy.ops.object.shade_smooth()

    # Neck connector (small box bridging plate top to bail)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, bail_y, PLATE_DEPTH_M / 2))
    neck = bpy.context.object
    neck.scale = (BAIL_R_MAJOR * 2.4, BAIL_R_MAJOR * 1.6, PLATE_DEPTH_M)
    bpy.ops.object.transform_apply(scale=True)
    neck.name = "Neck"

    # Join bail + neck
    bpy.ops.object.select_all(action='DESELECT')
    bail.select_set(True)
    neck.select_set(True)
    bpy.context.view_layer.objects.active = bail
    bpy.ops.object.join()
    return bpy.context.object


# ─── Materials ─────────────────────────────────────────────────────────────────

def apply_gold_material(obj, material_key: str, name: str = "GoldMat"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    base_color = MATERIAL_COLORS.get(material_key, MATERIAL_COLORS["yellow-gold"])
    bsdf.inputs["Base Color"].default_value    = base_color
    bsdf.inputs["Metallic"].default_value      = 1.0
    bsdf.inputs["Roughness"].default_value     = 0.08
    bsdf.inputs["Specular IOR Level"].default_value = 0.5

    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def apply_diamond_material(obj):
    mat = bpy.data.materials.new(name="DiamondMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    bsdf.inputs["Base Color"].default_value       = (1.0, 1.0, 1.0, 1.0)
    bsdf.inputs["Metallic"].default_value         = 0.0
    bsdf.inputs["Roughness"].default_value        = 0.0
    bsdf.inputs["IOR"].default_value              = 2.417
    bsdf.inputs["Transmission Weight"].default_value = 0.95
    bsdf.inputs["Coat Weight"].default_value      = 1.0

    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


# ─── Diamond Pavé ──────────────────────────────────────────────────────────────

def add_diamonds(text_obj):
    """Scatter small brilliant-cut diamonds on the text front face via raycasting."""
    import mathutils

    depsgraph   = bpy.context.evaluated_depsgraph_get()
    bbox        = [text_obj.matrix_world @ mathutils.Vector(c) for c in text_obj.bound_box]
    min_x = min(c.x for c in bbox);  max_x = max(c.x for c in bbox)
    min_z = min(c.z for c in bbox);  max_z = max(c.z for c in bbox)
    front_y = max(c.y for c in bbox)

    # Diamond template (tiny brilliant cut approximation)
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.0008, radius2=0.0016, depth=0.001)
    template = bpy.context.object
    template.name = "DiamondTemplate"
    template.hide_set(True)
    template.hide_render = True

    spacing = 0.0022
    placed  = []
    x = min_x + spacing / 2
    row = 0
    while x <= max_x:
        z = min_z + spacing / 2
        while z <= max_z:
            ox = x + (spacing / 2 if row % 2 else 0)
            origin    = mathutils.Vector((ox, front_y + 0.05, z))
            direction = mathutils.Vector((0, -1, 0))
            ok, loc, normal, _, obj_hit, _ = bpy.context.scene.ray_cast(depsgraph, origin, direction)
            if ok and obj_hit == text_obj and normal.y > 0.7:
                d = template.copy()
                d.data = template.data.copy()
                d.location = loc + mathutils.Vector((0, -0.0003, 0))
                bpy.context.collection.objects.link(d)
                placed.append(d)
            z += spacing
        row += 1
        x += spacing

    template.hide_set(False)
    if placed:
        bpy.ops.object.select_all(action='DESELECT')
        for d in placed:
            d.select_set(True)
        bpy.context.view_layer.objects.active = placed[0]
        bpy.ops.object.join()
        diamonds = bpy.context.active_object
        diamonds.name = "DiamondInstance"
        apply_diamond_material(diamonds)

    # Remove template
    bpy.data.objects.remove(template, do_unlink=True)


# ─── Lighting ──────────────────────────────────────────────────────────────────

def setup_lighting():
    # Three-point lighting rig for GLB preview
    lights = [
        ("KeyLight",   (0.3, -0.3,  0.4), 800),
        ("FillLight",  (-0.3, -0.1, 0.2), 300),
        ("RimLight",   (0,     0.4, 0.3), 200),
    ]
    for name, pos, strength in lights:
        bpy.ops.object.light_add(type='AREA', location=pos)
        l = bpy.context.object
        l.name = name
        l.data.energy = strength
        l.data.size   = 0.2


# ─── Export ────────────────────────────────────────────────────────────────────

def export_glb(filepath: str):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        export_materials='EXPORT',
        export_apply=True,
        export_lights=True,
    )
    print(f"SUCCESS: GLB exported to {filepath}")


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    # Args: name  material  font  has_diamonds  output_glb
    args = sys.argv[sys.argv.index("--") + 1:]
    name         = args[0]
    material     = args[1]                       # e.g. "yellow-gold"
    font         = args[2].lower()               # e.g. "pacifico"
    has_diamonds = args[3].lower() == "true"
    output_path  = args[4]

    clear_scene()

    # 1. Plate
    plate = create_plate()
    apply_gold_material(plate, material, "PlateMat")

    # 2. Text
    text = create_text_mesh(name, font)
    apply_gold_material(text, material, "TextMat")

    # 3. Bail
    bail = create_bail()
    apply_gold_material(bail, material, "BailMat")

    # 4. Diamonds (optional)
    if has_diamonds:
        add_diamonds(text)

    # 5. Lighting
    setup_lighting()

    # 6. Export
    export_glb(output_path)


if __name__ == "__main__":
    main()
