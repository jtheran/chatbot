FROM node:22

# Instalar dependencias del sistema necesarias para Chromium
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    xdg-utils \
    wget \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Copiar variables de entorno si es necesario
COPY .env .env

# Exponer el puerto que usa tu backend
EXPOSE 3325

# Comando para iniciar tu app
#CMD sh -c "npx prisma migrate deploy && npx prisma generate && npm run start"

