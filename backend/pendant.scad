// ============================================================
// pendant.scad — Name Necklace Pendant (NO backing plate)
// Design: extruded name text + thin base spine + bail ring
//
// Called headlessly via xvfb-run:
//   openscad -o out.stl pendant.scad -D 'NAME="Sara"' -D 'FONT="Pacifico"'
// ============================================================

// Parameters
NAME          = "Aura";
FONT          = "Pacifico";   // "Pacifico" | "Cinzel:style=Regular" | "Dancing Script:style=Regular" | "Bebas Neue:style=Regular"
TEXT_SIZE_MM  = 9;            // Font size in mm — width auto-scales in STL viewer
TEXT_DEPTH_MM = 3.5;          // Extrusion depth — thick/solid for jewelry casting
BEVEL_MM      = 0.3;          // Edge bevel

SPINE_H_MM    = 2.5;          // Base spine height connecting all letters
SPINE_T_MM    = 2.0;          // Spine thickness (same as text depth)

BAIL_OUTER_R  = 2.0;          // Bail ring outer radius (mm)
BAIL_INNER_R  = 1.0;          // Bail ring inner radius
BAIL_THICK    = 1.5;          // Bail tube thickness

// ─── Modules ───────────────────────────────────────────────────

// The name extruded
module name_text() {
    linear_extrude(height = TEXT_DEPTH_MM, convexity = 10)
        text(NAME, size = TEXT_SIZE_MM, font = FONT,
             halign = "center", valign = "center", $fn = 48);
}

// Thin spine at the bottom — connects all letter islands
module base_spine(text_w, text_h) {
    spine_w = text_w * 1.02;
    translate([0, -(text_h / 2 + SPINE_H_MM / 2), TEXT_DEPTH_MM / 2])
    cube([spine_w, SPINE_H_MM, SPINE_T_MM], center = true);
}

// Bail ring above the text
module bail(text_h) {
    bail_y = text_h / 2 + BAIL_OUTER_R * 0.8;
    translate([0, bail_y, TEXT_DEPTH_MM / 2])
    rotate([90, 0, 0])
    difference() {
        cylinder(r = BAIL_OUTER_R, h = BAIL_THICK, center = true, $fn = 48);
        cylinder(r = BAIL_INNER_R, h = BAIL_THICK + 0.2, center = true, $fn = 48);
    }
}

// Neck pillar: plate top → bail
module bail_neck(text_h) {
    neck_y = text_h / 2;
    neck_z  = TEXT_DEPTH_MM / 2;
    translate([0, neck_y, neck_z])
        cylinder(r = BAIL_INNER_R * 1.4, h = BAIL_OUTER_R * 1.6, center = true, $fn = 24);
}

// ─── Assembly ──────────────────────────────────────────────────
//
// Estimate text bounding box (approximation — exact size depends on font)
// text_w ≈ number_of_chars × 6mm;  text_h ≈ TEXT_SIZE_MM
text_w_approx = len(NAME) * TEXT_SIZE_MM * 0.62;
text_h_approx = TEXT_SIZE_MM * 1.1;

union() {
    // 1. Extruded name
    name_text();

    // 2. Base spine connecting all letters
    base_spine(text_w_approx, text_h_approx);

    // 3. Bail
    bail(text_h_approx);

    // 4. Neck connector
    bail_neck(text_h_approx);
}
