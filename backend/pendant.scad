// ============================================================
// pendant.scad — Parametric Jewelry Pendant Generator
// Called headlessly: openscad -o out.stl pendant.scad
//   -D 'NAME="Sara"' -D 'FONT="Cinzel:style=Regular"'
//   -D 'WIDTH_MM=50' -D 'TEXT_DEPTH_MM=1.2'
// ============================================================

// Parameters (override via -D on command line)
NAME            = "Aura";
FONT            = "Pacifico";       // "Pacifico" | "Cinzel:style=Regular" | "Dancing Script:style=Regular" | "Bebas Neue:style=Regular"
WIDTH_MM        = 50;               // Target pendant width in mm
PLATE_H_MM      = 14;              // Pendant plate height
PLATE_D_MM      = 2.8;            // Plate depth / thickness
TEXT_D_MM       = 1.2;            // Text relief height above plate
CORNER_R_MM     = 2.5;            // Corner radius of plate
BAIL_OUTER_R    = 2.0;            // Bail ring outer radius (mm)
BAIL_INNER_R    = 1.0;            // Bail ring inner radius (mm)
BAIL_THICKNESS  = 1.5;            // Bail tube thickness (mm)

// ─── Helpers ────────────────────────────────────────────────

// Rounded rectangle via hull of 4 cylinders
module rounded_rect(w, h, d, r) {
    hull() {
        for (x = [-(w/2 - r), (w/2 - r)])
        for (y = [-(h/2 - r), (h/2 - r)])
            translate([x, y, 0]) cylinder(r=r, h=d, $fn=32);
    }
}

// Text solid — centred, scaled to fill available width
module pendant_text() {
    // Use scale to nail the target width; OpenSCAD text size ≠ mm exactly
    // We extrude at size=10 and scale to fit, keeping constant depth
    linear_extrude(height = TEXT_D_MM + 0.2)
        text(NAME, size = 9, font = FONT,
             halign = "center", valign = "center", $fn = 48);
}

// Bail ring (torus cross-section) sitting on top of plate
module bail() {
    z_offset = PLATE_D_MM + BAIL_OUTER_R;
    translate([0, PLATE_H_MM / 2 - BAIL_OUTER_R, z_offset])
    rotate([90, 0, 0])
    difference() {
        cylinder(r = BAIL_OUTER_R, h = BAIL_THICKNESS, center = true, $fn = 48);
        cylinder(r = BAIL_INNER_R, h = BAIL_THICKNESS + 0.2, center = true, $fn = 48);
    }
}

// Neck at top of plate connecting to bail
module bail_neck() {
    neck_w = BAIL_OUTER_R * 2.2;
    neck_h = BAIL_OUTER_R * 1.4;
    translate([0, PLATE_H_MM / 2 - neck_h / 2, 0])
        rounded_rect(neck_w, neck_h, PLATE_D_MM + 0.1, 0.8);
}

// ─── Main Assembly ───────────────────────────────────────────

union() {
    // 1. Pendant plate
    rounded_rect(WIDTH_MM, PLATE_H_MM, PLATE_D_MM, CORNER_R_MM);

    // 2. Text relief on top face
    translate([0, 0, PLATE_D_MM - 0.1])
        pendant_text();

    // 3. Bail ring
    bail();

    // 4. Neck bridge between plate top and bail
    bail_neck();
}
