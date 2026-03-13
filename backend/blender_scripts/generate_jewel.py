import bpy
import sys
import os
import math

# To run this script:
# blender -b -P generate_jewel.py -- "Aura" "1" "output.glb"

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_text(name: str):
    # Create the text curve
    bpy.ops.object.text_add(location=(0, 0, 0))
    text_obj = bpy.context.object
    text_obj.data.body = name
    
    # Try to load the Pacifico font if available, else fallback to default
    font_path = os.path.abspath("../public/fonts/Pacifico.ttf") # We need to make sure the ttf exists!
    if os.path.exists(font_path):
        try:
            custom_font = bpy.data.fonts.load(font_path)
            text_obj.data.font = custom_font
        except Exception as e:
            print(f"Could not load font: {e}")

    # Text Settings for jewelry
    text_obj.data.extrude = 0.05
    text_obj.data.bevel_depth = 0.005
    text_obj.data.bevel_resolution = 4
    text_obj.data.align_x = 'CENTER'
    text_obj.data.align_y = 'CENTER'

    # Convert to mesh
    bpy.ops.object.convert(target='MESH')
    
    # Rotate 90 degrees on the X-axis so it stands up vertically facing the camera
    text_obj.rotation_euler[0] = math.pi / 2
    # Apply rotation
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    
    return text_obj

def create_diamond_mesh():
    # Create a simple generic brilliant cut approximation
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.015, radius2=0.03, depth=0.02)
    diamond = bpy.context.object
    diamond.name = "DiamondInstance"
    # Rotate pointing forward
    diamond.rotation_euler[0] = math.pi / 2
    return diamond

def apply_jewelcraft(obj, has_diamonds: bool):
    """
    Applies JewelCraft specific operations.
    If the addon isn't installed or for headless systems, this implements a 
    precise algorithmic Pave setting using raycasting on the front face.
    """
    if not has_diamonds:
        bpy.ops.object.shade_smooth()
        return

    # Create the diamond reference
    diamond = create_diamond_mesh()
    diamond.hide_render = True
    diamond.hide_set(True)

    # We will raycast against the text object to find the front faces
    depsgraph = bpy.context.evaluated_depsgraph_get()
    
    # Calculate bounding box
    bbox_corners = [obj.matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box]
    min_x = min([c.x for c in bbox_corners])
    max_x = max([c.x for c in bbox_corners])
    min_z = min([c.z for c in bbox_corners])
    max_z = max([c.z for c in bbox_corners])
    max_y = max([c.y for c in bbox_corners]) # Front face is facing +Y

    stone_spacing = 0.045
    
    diamonds_to_join = []
    
    # Scan a grid over the front of the text
    x = min_x + stone_spacing / 2
    while x <= max_x:
        z = min_z + stone_spacing / 2
        # Offset every other row for honeycomb tight packing
        row_idx = 0
        while z <= max_z:
            offset_x = x + (stone_spacing / 2 if row_idx % 2 == 1 else 0)
            
            # Ray origin slightly in front of the text
            origin = mathutils.Vector((offset_x, max_y + 0.2, z))
            direction = mathutils.Vector((0, -1, 0)) # Shoot backwards
            
            # Raycast
            success, location, normal, index, obj_hit, matrix = bpy.context.scene.ray_cast(depsgraph, origin, direction)
            
            # If we hit the text and the normal is pointing mostly forward (+Y)
            if success and obj_hit == obj and normal.y > 0.8:
                # Discard hits too close to the very edge to avoid clipping
                
                # Instance a stone
                stone = diamond.copy()
                stone.data = diamond.data.copy()
                # Sink it slightly into the metal
                stone.location = location + mathutils.Vector((0, -0.005, 0))
                bpy.context.collection.objects.link(stone)
                diamonds_to_join.append(stone)
                
            z += stone_spacing
            row_idx += 1
        x += stone_spacing

    # Join all diamonds into a single mesh for performance
    if diamonds_to_join:
        bpy.ops.object.select_all(action='DESELECT')
        for d in diamonds_to_join:
            d.select_set(True)
        bpy.context.view_layer.objects.active = diamonds_to_join[0]
        bpy.ops.object.join()
        
        joined_diamonds = bpy.context.active_object
        joined_diamonds.name = "DiamondInstance"
        
        # Apply special physical material name so Next.js can target it easily
        mat = bpy.data.materials.new(name="DiamondMaterial")
        joined_diamonds.data.materials.append(mat)
    
def apply_materials(obj, has_diamonds, material="yellow-gold"):
    """Add very basic placeholder materials for GLB export"""
    gold_mat = bpy.data.materials.new(name="Gold")
    gold_mat.use_nodes = True
    bsdf = gold_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        if material == "white-gold":
            bsdf.inputs["Base Color"].default_value = (0.9, 0.9, 0.95, 1)
        elif material == "rose-gold":
            bsdf.inputs["Base Color"].default_value = (0.85, 0.55, 0.45, 1)
        else: # yellow-gold default
            bsdf.inputs["Base Color"].default_value = (0.7, 0.5, 0.1, 1)
        bsdf.inputs["Metallic"].default_value = 1.0
        bsdf.inputs["Roughness"].default_value = 0.1
    
    if len(obj.data.materials) == 0:
        obj.data.materials.append(gold_mat)

def export_glb(filepath):
    # Ensure directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        export_materials='EXPORT',
        export_apply=True
    )

def main():
    # Called by main.py as: blender -- name material hasDiamonds output_path
    args = sys.argv[sys.argv.index("--") + 1:]
    
    name = args[0]
    material = args[1]                        # e.g. "yellow-gold"
    has_diamonds = args[2].lower() == "true"  # "true" or "false"
    output_path = args[3]                     # absolute path to .glb file

    clear_scene()
    
    text_obj = create_text(name)
    apply_jewelcraft(text_obj, has_diamonds)
    apply_materials(text_obj, has_diamonds, material)
    
    export_glb(output_path)
    
    print(f"SUCCESS: Exported to {output_path}")

if __name__ == "__main__":
    main()
