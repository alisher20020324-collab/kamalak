# Railway shu fayl bo'yicha quradi: Node.js + qahramonlar ovozi uchun Python edge-tts
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip ca-certificates \
  && pip3 install --no-cache-dir --break-system-packages edge-tts==7.3.1 \
  && rm -rf /var/lib/apt/lists/*

ENV TTS_PYTHON=python3
WORKDIR /app

# Avval faqat paketlar — kod o'zgarganda qayta o'rnatilmaydi
COPY backend/package.json backend/package-lock.json backend/
COPY frontend/package.json frontend/package-lock.json frontend/
RUN npm ci --prefix backend --omit=dev && npm ci --prefix frontend --include=dev

COPY . .
RUN npm run build --prefix frontend

CMD ["npm", "start", "--prefix", "backend"]
