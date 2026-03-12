import math

def generate_diamond_obj(filename="diamond.obj"):
    with open(filename, "w") as f:
        f.write("# Brilliant Cut Diamond\\n")
        
        # Parameters
        culet = [0.0, -0.6, 0.0]
        table_radius = 0.55
        table_height = 0.4
        girdle_radius = 1.0
        girdle_height = 0.05
        
        vertices = []
        
        # V1: Culet (bottom point)
        vertices.append(culet)
        
        # Girdle lower points (16 segments for high quality)
        segments = 16
        for i in range(segments):
            angle = (2 * math.pi / segments) * i
            x = girdle_radius * math.cos(angle)
            z = girdle_radius * math.sin(angle)
            vertices.append([x, 0, z])
            
        # Girdle upper points
        for i in range(segments):
            angle = (2 * math.pi / segments) * i
            x = girdle_radius * math.cos(angle)
            z = girdle_radius * math.sin(angle)
            vertices.append([x, girdle_height, z])
            
        # Table points
        for i in range(segments):
            angle = (2 * math.pi / segments) * i
            x = table_radius * math.cos(angle)
            z = table_radius * math.sin(angle)
            vertices.append([x, table_height, z])
            
        # Central table center
        vertices.append([0.0, table_height, 0.0])
        table_center_idx = len(vertices)

        # Write vertices to file
        for v in vertices:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\\n")
            
        f.write("\\n")
        
        # Write faces (1-indexed in OBJ)
        # 1 = culet
        # 2 to 17 = bottom girdle
        # 18 to 33 = top girdle
        # 34 to 49 = table edge
        # 50 = table center
        
        # Pavilion (bottom)
        for i in range(segments):
            p1 = 1
            p2 = 2 + i
            p3 = 2 + ((i + 1) % segments)
            f.write(f"f {p1} {p3} {p2}\\n")
            
        # Girdle (sides)
        for i in range(segments):
            b1 = 2 + i
            b2 = 2 + ((i + 1) % segments)
            t1 = 18 + i
            t2 = 18 + ((i + 1) % segments)
            f.write(f"f {b1} {t1} {t2}\\n")
            f.write(f"f {b1} {t2} {b2}\\n")
            
        # Crown (top)
        for i in range(segments):
            t1 = 18 + i
            t2 = 18 + ((i + 1) % segments)
            t3 = 34 + i
            t4 = 34 + ((i + 1) % segments)
            f.write(f"f {t1} {t3} {t4}\\n")
            f.write(f"f {t1} {t4} {t2}\\n")
            
        # Table (flat top)
        for i in range(segments):
            p1 = 34 + i
            p2 = 34 + ((i + 1) % segments)
            p3 = table_center_idx
            f.write(f"f {p3} {p1} {p2}\\n")

print("Generating diamond.obj...")
generate_diamond_obj("public/diamond.obj")
print("Done!")
