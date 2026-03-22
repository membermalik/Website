FROM ubuntu:22.04

# Avoid interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install System Dependencies (Blender, OpenSCAD, Xvfb for headless rendering)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    blender \
    openscad \
    xvfb \
    curl \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Set Working Directory
WORKDIR /app

# Install Python Requirements
COPY requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

# Download necessary fonts for OpenSCAD natively into the Linux container!
RUN mkdir -p /usr/share/fonts/custom && \
    curl -sL "https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf" -o /usr/share/fonts/custom/Pacifico-Regular.ttf && \
    curl -sL "https://github.com/google/fonts/raw/main/ofl/cinzel/Cinzel-Regular.ttf" -o /usr/share/fonts/custom/Cinzel-Regular.ttf && \
    curl -sL "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf" -o /usr/share/fonts/custom/DancingScript.ttf && \
    curl -sL "https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf" -o /usr/share/fonts/custom/BebasNeue-Regular.ttf && \
    fc-cache -fv

# Copy the rest of the Backend Application
COPY . .

# Ensure Output Directory exists and has correct permissions
RUN mkdir -p output && chmod 777 output

# Expose the API Port
EXPOSE 9000

# Start Xvfb (Virtual Framebuffer) and FastAPI
CMD ["sh", "-c", "Xvfb :99 -screen 0 1024x768x24 & export DISPLAY=:99 && uvicorn main:app --host 0.0.0.0 --port 9000"]
