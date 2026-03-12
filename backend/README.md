# Schmiede Backend (Blender / JewelCraft)

Dieses Backend nimmt Anfragen der Website entgegen, startet Blender im Hintergrund und baut die Namensketten in Echtzeit als 3D-Modell (.glb) zusammen.

## Voraussetzungen
1. **Python 3.x** installiert
2. **Blender 4.x** auf deinem System installiert und der Befehl `blender` muss in deinem Terminal/Befehlszeile (`PATH`) verfügbar sein.
3. (Optional aber empfohlen): Das JewelCraft-Addon in Blender installiert und aktiviert.

## Starten des Servers
Öffne ein neues Terminal im Ordner `backend` und führe folgende Befehle aus:

```bash
# Virtuelles Python-Environment aktivieren
source venv/bin/activate

# Server starten (Port 8000)
uvicorn main:app --reload
```

Der Server läuft dann unter `http://localhost:8000`. 
Die Next.js Website unter `http://localhost:3000` ist bereits so konfiguriert, dass sie beim Klick auf "Generate 3D Preview" mit diesem Server spricht!
