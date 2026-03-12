import bpy
import sys
import os

argv = sys.argv
argv = argv[argv.index("--") + 1:] # get all args after "--"

input_file = argv[0]
output_file = argv[1]

# Clear existing objects if any (though we are loading a new file)
bpy.ops.wm.read_factory_settings(use_empty=True)

# Load the user's blend file
bpy.ops.wm.open_mainfile(filepath=input_file)

# Make sure all objects are selectable and visible to export everything
for obj in bpy.context.scene.objects:
    obj.hide_set(False)
    obj.hide_select = False

# Export to glTF 2.0 Binary (.glb)
bpy.ops.export_scene.gltf(
    filepath=output_file,
    check_existing=False,
    export_format='GLB',
    ui_tab='GENERAL',
    export_copyright='',
    export_image_format='AUTO',
    export_texture_dir='',
    export_keep_originals=False,
    export_texcoords=True,
    export_normals=True,
    export_draco_mesh_compression_enable=False,
    export_tangents=False,
    export_materials='EXPORT',
    export_colors=True,
    export_cameras=False,
    export_lights=False,
    export_extras=False,
    export_yup=True,
    export_apply=True,
    export_animations=False,
    export_frame_range=False,
    export_frame_step=1,
    export_force_sampling=True,
    export_nla_strips=True,
    export_def_bones=False,
    export_current_frame=False,
    export_skins=True,
    export_all_influences=False,
    export_morph=True,
    export_morph_normal=True,
    export_morph_tangent=False
)

print(f"Successfully exported {input_file} to {output_file}")
