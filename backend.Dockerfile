FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    blender \
    openscad \
    xvfb \
    curl \
    fontconfig \
    python3-numpy \
    python3-scipy \
    python3-trimesh \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

RUN mkdir -p /usr/share/fonts/custom && \
    curl -sL "https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf" -o /usr/share/fonts/custom/Pacifico-Regular.ttf && \
    curl -sL "https://github.com/google/fonts/raw/main/ofl/cinzel/Cinzel-Regular.ttf" -o /usr/share/fonts/custom/Cinzel-Regular.ttf && \
    curl -sL "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf" -o /usr/share/fonts/custom/DancingScript.ttf && \
    curl -sL "https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf" -o /usr/share/fonts/custom/BebasNeue-Regular.ttf && \
    fc-cache -fv

COPY backend/ .

RUN mkdir -p output && chmod 777 output

EXPOSE 9000

CMD ["sh", "-c", "Xvfb :99 -screen 0 1024x768x24 & export DISPLAY=:99 && uvicorn main:app --host 0.0.0.0 --port 9000"]
