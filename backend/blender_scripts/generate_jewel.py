"""
generate_jewel.py  ─  Name Necklace Pendant Generator (Blender)
─────────────────────────────────────────────────────────────────
Design: NO backing plate — just the name itself as the pendant,
connected by a thin base-spine, with a bail ring at the top.

Called by main.py:
  blender -b -P generate_jewel.py -- <name> <material> <font> <has_diamonds> <output_glb>
"""
import bpy
import sys
import os
import math
import bmesh

# ─── Constants ────────────────────────────────────────────────
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

# Real-world target size: the name = 50mm wide
TARGET_WIDTH_M  = 0.050   # 50 mm
TEXT_HEIGHT_M   = 0.018   # ~18 mm tall letters
TEXT_EXTRUDE_M  = 0.0035  # 3.5 mm depth — solid, printable
TEXT_BEVEL_M    = 0.0003  # tiny bevel for nice edges
SPINE_THICK_M   = 0.0020  # 2 mm thin bar connecting letters at base
SPINE_HEIGHT_M  = 0.0025  # 2.5 mm height of the spine
BAIL_R_MAJOR    = 0.0020  # 2 mm bail ring outer radius
BAIL_R_MINOR    = 0.0008  # 0.8 mm tube thickness


# ─── Scene Setup ────────────────────────────────────────────────────────────

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


# ─── Gold Material ──────────────────────────────────────────────────────────

def make_gold_material(material_key: str, name: str = "Gold"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    out  = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    color = MATERIAL_COLORS.get(material_key, MATERIAL_COLORS["yellow-gold"])
    bsdf.inputs["Base Color"].default_value          = color
    bsdf.inputs["Metallic"].default_value            = 1.0
    bsdf.inputs["Roughness"].default_value           = 0.07
    bsdf.inputs["Specular IOR Level"].default_value  = 0.5
    return mat


def apply_material(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


# ─── Name Text Mesh ─────────────────────────────────────────────────────────

def create_name_mesh(name: str, font_key: str) -> bpy.types.Object:
    """
    Create extruded text, scale to TARGET_WIDTH_M, convert to mesh.
    The text lies in the XZ-plane (face pointing in +Y direction),
    which means it faces the camera when viewed from front.
    """
    bpy.ops.object.text_add(location=(0, 0, 0))
    txt = bpy.context.object
    txt.name = "NameText"
    txt.data.body       = name
    txt.data.align_x    = 'CENTER'
    txt.data.align_y    = 'CENTER'

    # Load font
    font_file = os.path.join(FONTS_DIR, FONT_MAP.get(font_key, "Pacifico.ttf"))
    if os.path.exists(font_file):
        try:
            font = bpy.data.fonts.load(font_file)
            txt.data.font = font
        except Exception as e:
            print(f"Font load error: {e}")

    # Extrusion — thick enough to be solid jewelry
    txt.data.extrude         = TEXT_EXTRUDE_M
    txt.data.bevel_depth     = TEXT_BEVEL_M
    txt.data.bevel_resolution = 2

    # Text is created in XY plane; rotate so face points +Y (front)
    txt.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(rotation=True)

    # Convert to mesh
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.transform_apply(location=True, scale=True)

    # Scale to target width
    bpy.context.view_layer.update()
    w = txt.dimensions.x
    if w > 0.001:
        sf = TARGET_WIDTH_M / w
        txt.scale = (sf, sf, sf)
        bpy.ops.object.transform_apply(scale=True)

    # Centre at world origin
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    txt.location = (0, 0, 0)
    bpy.ops.object.transform_apply(location=True)

    bpy.ops.object.shade_smooth()
    return txt


# ─── Base Spine (connects all letter islands) ────────────────────────────────

def create_base_spine(text_obj: bpy.types.Object) -> bpy.types.Object:
    """
    Thin flat bar running the full width at the bottom of the name.
    This visually and structurally connects all letters.
    """
    bpy.context.view_layer.update()
    w  = text_obj.dimensions.x
    bz = text_obj.location.z - text_obj.dimensions.z / 2.0  # bottom of text in world Z

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, bz + SPINE_HEIGHT_M / 2))
    spine = bpy.context.object
    spine.name = "BaseSpine"
    spine.scale = (w * 1.01, TEXT_EXTRUDE_M, SPINE_HEIGHT_M)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    return spine


# ─── Bail Ring ──────────────────────────────────────────────────────────────

def create_bail(text_obj: bpy.types.Object) -> bpy.types.Object:
    """Bail (Öse) ring sitting at the top-centre of the name."""
    bpy.context.view_layer.update()
    top_z = text_obj.location.z + text_obj.dimensions.z / 2.0

    bail_z = top_z + BAIL_R_MAJOR * 1.2

    bpy.ops.mesh.primitive_torus_add(
        major_radius  = BAIL_R_MAJOR,
        minor_radius  = BAIL_R_MINOR,
        major_segments = 48,
        minor_segments = 12,
        location      = (0, 0, bail_z),
        rotation      = (math.pi / 2, 0, 0),   # ring opens left-right for chain
    )
    bail = bpy.context.object
    bail.name = "Bail"

    # Small neck pillar connecting top of name to bail
    bpy.ops.mesh.primitive_cylinder_add(
        radius   = BAIL_R_MINOR * 1.5,
        depth    = BAIL_R_MAJOR * 1.4,
        location = (0, 0, top_z + BAIL_R_MAJOR * 0.6),
    )
    neck = bpy.context.object
    neck.name = "BailNeck"

    # Join bail + neck
    bpy.ops.object.select_all(action='DESELECT')
    bail.select_set(True)
    neck.select_set(True)
    bpy.context.view_layer.objects.active = bail
    bpy.ops.object.join()
    bpy.ops.object.shade_smooth()
    return bpy.context.object


# ─── Diamond Pavé ────────────────────────────────────────────────────────────

def add_diamonds(text_obj):
    import mathutils
    depsgraph = bpy.context.evaluated_depsgraph_get()
    bbox      = [text_obj.matrix_world @ mathutils.Vector(c) for c in text_obj.bound_box]
    min_x = min(c.x for c in bbox);  max_x = max(c.x for c in bbox)
    min_z = min(c.z for c in bbox);  max_z = max(c.z for c in bbox)
    front_y = max(c.y for c in bbox)

    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.0007, radius2=0.0014, depth=0.0010)
    template = bpy.context.object
    template.name = "DiamondTemplate"
    template.hide_set(True)
    template.hide_render = True

    spacing = 0.0020
    placed  = []
    x, row  = min_x + spacing / 2, 0
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
        x  += spacing

    template.hide_set(False)
    if placed:
        bpy.ops.object.select_all(action='DESELECT')
        for d in placed:
            d.select_set(True)
        bpy.context.view_layer.objects.active = placed[0]
        bpy.ops.object.join()
        diamonds = bpy.context.active_object
        diamonds.name = "DiamondInstance"
        mat = bpy.data.materials.new(name="DiamondMat")
        mat.use_nodes = True
        n = mat.node_tree.nodes
        l = mat.node_tree.links
        n.clear()
        out  = n.new('ShaderNodeOutputMaterial')
        bsdf = n.new('ShaderNodeBsdfPrincipled')
        l.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
        bsdf.inputs["Base Color"].default_value          = (1,1,1,1)
        bsdf.inputs["Roughness"].default_value           = 0.0
        bsdf.inputs["IOR"].default_value                 = 2.417
        bsdf.inputs["Transmission Weight"].default_value = 0.95
        apply_material(diamonds, mat)
    bpy.data.objects.remove(template, do_unlink=True)


# ─── Lighting ────────────────────────────────────────────────────────────────

def setup_lighting():
    for name, pos, strength in [
        ("Key",  ( 0.2, -0.3, 0.3), 600),
        ("Fill", (-0.2, -0.1, 0.1), 250),
        ("Rim",  ( 0.0,  0.4, 0.2), 150),
    ]:
        bpy.ops.object.light_add(type='AREA', location=pos)
        bpy.context.object.name = name
        bpy.context.object.data.energy = strength
        bpy.context.object.data.size   = 0.15


# ─── Export ─────────────────────────────────────────────────────────────────

def export_glb(filepath: str):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        export_materials='EXPORT',
        export_apply=True,
    )
    size = os.path.getsize(filepath) if os.path.exists(filepath) else 0
    print(f"SUCCESS: GLB exported to {filepath} ({size:,} bytes)")


# ─── Main ───────────────────────────────────────────────────────────────────

def main():
    args         = sys.argv[sys.argv.index("--") + 1:]
    name         = args[0]
    material     = args[1]
    font         = args[2].lower()
    has_diamonds = args[3].lower() == "true"
    output_path  = args[4]

    clear_scene()
    gold = make_gold_material(material, "Gold")

    # 1. Name text
    text = create_name_mesh(name, font)
    apply_material(text, gold)

    # 2. Thin base spine — connects all letter islands
    spine = create_base_spine(text)
    apply_material(spine, gold)

    # 3. Bail ring at top
    bail = create_bail(text)
    apply_material(bail, gold)

    # 4. Optional diamond pavé on the text face
    if has_diamonds:
        add_diamonds(text)

    # 5. Lighting
    setup_lighting()

    # 6. Export GLB
    export_glb(output_path)


if __name__ == "__main__":
    main()
